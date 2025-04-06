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
  gender: string;
  email: string;
  phone: string;
  cpf: string; // Add this line
  profession: string;
  maritalStatus: string;
  address: Address;
  emergencyContact: EmergencyContact;
}