import {IBlockModel} from 'bo-trading-common/lib/models/blocks';
import {BlockSchema} from 'bo-trading-common/lib/schemas';
import {RepositoryBase} from './base';

export default class BlockRepository extends RepositoryBase<IBlockModel> {
  constructor() {
    super(BlockSchema);
  }
}
