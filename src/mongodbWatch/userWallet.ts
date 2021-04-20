import {UserWalletSchema} from 'bo-trading-common/lib/schemas';

export const UserWalletWatch = () => {
  const pipeline = [
    {
      $match: {operationType: 'update'},
    },
    {
      $project: {
        'fullDocument.user_id': 1,
        'fullDocument.amount_trade': 1,
        'fullDocument.amount_demo': 1,
        'fullDocument.amount_expert': 1,
        'fullDocument.amount_copytrade': 1,
      },
    },
  ];
  UserWalletSchema.watch(pipeline, {fullDocument: 'updateLookup'}).on('change', (event) => {});
};
