import React, { useState } from 'react';
import { User, Phone, Mail, Briefcase, Heart, Home, AlertCircle, Brain } from 'lucide-react';
import InputMask from 'react-input-mask';
import { type Patient, type Address } from './types';

function App() {
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<Patient>({
    name: '',
    birthDate: '',
    gender: 'male',
    email: '',
    phone: '',
    profession: '',
    maritalStatus: '',
    address: {
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
  });

  const fetchAddressByCep = async (cep: string) => {
    if (cep.replace(/\D/g, '').length !== 8) return;

    setLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json() as Address;
      
      if (!data.erro) {
        setPatient(prev => ({
          ...prev,
          address: {
            ...prev.address,
            cep,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          },
        }));
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', patient);
    // Here you would typically send the data to your backend
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setPatient(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof Patient],
          [child]: value,
        },
      }));
    } else {
      setPatient(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    if (name === 'address.cep') {
      const cep = value.replace(/\D/g, '');
      if (cep.length === 8) {
        fetchAddressByCep(cep);
      }
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-morphism rounded-xl p-6 sm:p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Brain className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-purple-400">Cadastro de Paciente</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Pessoais
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nome Completo</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={patient.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full"
                  />
                </div>

                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-300">Data de Nascimento</label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={patient.birthDate}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-300">Sexo</label>
                  <select
                    id="gender"
                    name="gender"
                    value={patient.gender}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full"
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-300">Estado Civil</label>
                  <select
                    id="maritalStatus"
                    name="maritalStatus"
                    value={patient.maritalStatus}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full"
                  >
                    <option value="">Selecione...</option>
                    <option value="single">Solteiro(a)</option>
                    <option value="married">Casado(a)</option>
                    <option value="divorced">Divorciado(a)</option>
                    <option value="widowed">Viúvo(a)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contato
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                  <div className="mt-1 flex items-center">
                    <Mail className="w-5 h-5 text-gray-500 mr-2" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={patient.email}
                      onChange={handleInputChange}
                      required
                      className="block w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300">Telefone</label>
                  <InputMask
                    mask="(99) 99999-9999"
                    type="tel"
                    id="phone"
                    name="phone"
                    value={patient.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full"
                  />
                </div>

                <div>
                  <label htmlFor="profession" className="block text-sm font-medium text-gray-300">Profissão</label>
                  <div className="mt-1 flex items-center">
                    <Briefcase className="w-5 h-5 text-gray-500 mr-2" />
                    <input
                      type="text"
                      id="profession"
                      name="profession"
                      value={patient.profession}
                      onChange={handleInputChange}
                      required
                      className="block w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Endereço
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-1">
                  <label htmlFor="address.cep" className="block text-sm font-medium text-gray-300">CEP</label>
                  <InputMask
                    mask="99999-999"
                    type="text"
                    id="address.cep"
                    name="address.cep"
                    value={patient.address.cep}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-300">Rua</label>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={patient.address.street}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full"
                  />
                </div>

                <div>
                  <label htmlFor="address.number" className="block text-sm font-medium text-gray-300">Número</label>
                  <input
                    type="text"
                    id="address.number"
                    name="address.number"
                    value={patient.address.number}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full"
                  />
                </div>

                <div>
                  <label htmlFor="address.complement" className="block text-sm font-medium text-gray-300">Complemento</label>
                  <input
                    type="text"
                    id="address.complement"
                    name="address.complement"
                    value={patient.address.complement}
                    onChange={handleInputChange}
                    className="mt-1 block w-full"
                  />
                </div>

                <div>
                  <label htmlFor="address.neighborhood" className="block text-sm font-medium text-gray-300">Bairro</label>
                  <input
                    type="text"
                    id="address.neighborhood"
                    name="address.neighborhood"
                    value={patient.address.neighborhood}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full"
                  />
                </div>

                <div>
                  <label htmlFor="address.city" className="block text-sm font-medium text-gray-300">Cidade</label>
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    value={patient.address.city}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full"
                  />
                </div>

                <div>
                  <label htmlFor="address.state" className="block text-sm font-medium text-gray-300">Estado</label>
                  <input
                    type="text"
                    id="address.state"
                    name="address.state"
                    value={patient.address.state}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Contato de Emergência
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="emergencyContact.name" className="block text-sm font-medium text-gray-300">Nome</label>
                  <input
                    type="text"
                    id="emergencyContact.name"
                    name="emergencyContact.name"
                    value={patient.emergencyContact.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full"
                  />
                </div>

                <div>
                  <label htmlFor="emergencyContact.phone" className="block text-sm font-medium text-gray-300">Telefone</label>
                  <InputMask
                    mask="(99) 99999-9999"
                    type="tel"
                    id="emergencyContact.phone"
                    name="emergencyContact.phone"
                    value={patient.emergencyContact.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full"
                  />
                </div>

                <div>
                  <label htmlFor="emergencyContact.relationship" className="block text-sm font-medium text-gray-300">Parentesco</label>
                  <input
                    type="text"
                    id="emergencyContact.relationship"
                    name="emergencyContact.relationship"
                    value={patient.emergencyContact.relationship}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-400 transition-colors duration-200"
              >
                {loading ? 'Carregando...' : 'Cadastrar Paciente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;