import { UserDocument } from '../../models/user.schema';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}
