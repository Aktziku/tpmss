declare module 'phil-reg-prov-mun-brgy' {
  export interface Region {
    reg_code: string;
    name: string;
    region_name?: string;
  }

  export interface Province {
    prov_code: string;
    reg_code: string;
    name: string;
  }

  export interface Municipality {
    mun_code: string;
    prov_code: string;
    name: string;
  }

  export interface Barangay {
    brgy_code: string;
    mun_code: string;
    name: string;
  }

  export const regions: Region[];
  export const provinces: Province[];
  export const city_mun: Municipality[];
  export const barangays: Barangay[];
}