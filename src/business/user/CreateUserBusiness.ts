import config from '@src/config';
import IUserModel from '@src/models/Users/IUserModel';
import UserRepository from '@src/repository/UserRepository';
import EmailConfig from '@src/utils/emailConfig';
import { CreateUserValidator } from '@src/validator/users/CreateUser';
import { validate } from 'class-validator';
import handlebars from 'handlebars';

export const createUserBusiness = async (account: CreateUserValidator): Promise<Boolean> => {
  try {
    const validation = await validate(account);
    if (validation.length > 0) {
      throw new Error(Object.values(validation[0].constraints)[0]);
    } else {
      const faker = require('faker');
      const userRes = new UserRepository();
      /** tạo url để gửi verification email */
      const uuid = faker.datatype.uuid();
      /** create user */
      const user = await userRes.create(<IUserModel>{
        username: account.username.toLowerCase(),
        email: account.email,
        password: account.password,
        ref_code: faker.vehicle.vrm(),
        verify_code: uuid,
      });
      if (!user) throw new Error('Create user fail!');
      /** tạo tài khoản demo */
      userRes.create(<IUserModel>{
        username: `${user.username}_demo`,
        full_name: `${user.username} Demo`,
        email: account.password,
        password: account.password,
        type_user: 1,
        user_parent_id: user.id,
        amount: 10000,
      });
      /** thêm phân cấp hoa hồng */
      userRes.findOne({ ref_code: account.referralUser, type_user: 0 }).then((userParent) => {
        if (!userParent) return;
        let commissionLevel = [];
        /** nếu đã có danh sách level thì lấy ra 20 level cuối cùng, nếu không thêm referral hiện tại làm level 1 */
        if (userParent.commission_level.length > 0) {
          commissionLevel = [...userParent.commission_level.slice(-19)];
          commissionLevel.push(userParent.id);
        } else {
          commissionLevel.push(userParent.id);
        }
        userRes.updateById(user.id, { commission_level: commissionLevel });
      });
      /** gửi email verification */
      const emailConfig = new EmailConfig();
      emailConfig.readHTMLFile(`${config.PATH_TEMPLATE_EMAIL}/verification_email.html`, async (html: string) => {
        const template = handlebars.compile(html);
        const replacements = {
          linkVerification: config.URL_WEB_VERIFICATION_EMAIL + uuid,
        };
        const htmlToSend = template(replacements);
        emailConfig.send(config.EMAIL_ROOT, user.email, 'Verify your account', htmlToSend);
      });
      return true;
    }
  } catch (err) {
    throw err;
  }
};
