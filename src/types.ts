export interface Address {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export interface Patient {
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  profession: string;
  maritalStatus: string;
  address: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}