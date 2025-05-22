// export class Address {
//   @Prop()
//   is_activated: boolean;

//   @Prop()
//   country: string;

//   @Prop()
//   state: string;

//   @Prop()
//   city: string;

//   @Prop()
//   zip_code: string;

//   @Prop()
//   address_line1: string;

//   @Prop()
//   address_line2: string;
// }

export interface addressInterface {
  user: string;
  is_activated: boolean;
  country: string;
  state: string;
  city: string;
  zip_code: string;
  address_line1?: string;
  address_line2?: string;
}
