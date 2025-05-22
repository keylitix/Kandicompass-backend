import mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const isValidMongoObjectId = (str_id: string): boolean => {
  return ObjectId.isValid(str_id);
};

export const isAllvalidMongoObjectIds = (ids: string[]) => {
  const isAllValid = ids.map(id => isValidMongoObjectId(id)).every(id => id === true);
  return isAllValid;
};

export const convert_multiple_ids = (ids: string[]) => {
  return ids.map(id => new ObjectId(id));
};

export const convert_into_objectid = (id: string): any => {
  return new ObjectId(id);
};
