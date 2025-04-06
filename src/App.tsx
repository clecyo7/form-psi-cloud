import React, { useState } from 'react';
import { User, Phone, Mail, Briefcase, Heart, Home, AlertCircle, Brain, ChevronDown, FileText } from 'lucide-react';
import InputMask from 'react-input-mask';
import { type Patient, type Address } from './types';

function App() {
  // Add country code state
  const [phoneCountryCode, setPhoneCountryCode] = useState('55');
  const [emergencyPhoneCountryCode, setEmergencyPhoneCountryCode] = useState('55');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showEmergencyCountryDropdown, setShowEmergencyCountryDropdown] = useState(false);
  const [cpfError, setCpfError] = useState('');
  
  // Country codes with flags
  const countries = [
    { code: '55', flag: '🇧🇷', name: 'Brasil' },
    { code: '595', flag: '🇵🇾', name: 'Paraguai' },
    { code: '54', flag: '🇦🇷', name: 'Argentina' },
    { code: '591', flag: '🇧🇴', name: 'Bolívia' },
    { code: '56', flag: '🇨🇱', name: 'Chile' },
    { code: '57', flag: '🇨🇴', name: 'Colômbia' },
    { code: '593', flag: '🇪🇨', name: 'Equador' },
    { code: '598', flag: '🇺🇾', name: 'Uruguai' },
    { code: '58', flag: '🇻🇪', name: 'Venezuela' },
    { code: '51', flag: '🇵🇪', name: 'Peru' },
    { code: '1', flag: '🇺🇸', name: 'Estados Unidos' },
    { code: '351', flag: '🇵🇹', name: 'Portugal' },
    { code: '34', flag: '🇪🇸', name: 'Espanha' },
    { code: '44', flag: '🇬🇧', name: 'Reino Unido' },
    { code: '49', flag: '🇩🇪', name: 'Alemanha' },
    { code: '33', flag: '🇫🇷', name: 'França' },
    { code: '39', flag: '🇮🇹', name: 'Itália' },
    { code: '81', flag: '🇯🇵', name: 'Japão' },
    { code: '86', flag: '🇨🇳', name: 'China' },
  ];
  
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const [patient, setPatient] = useState<Patient>({
    name: '',
    birthDate: '',
    gender: 'masculino', // Changed from 'male' to 'masculino'
    email: '',
    phone: '',
    cpf: '',
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

  const validateCPF = (cpf: string): boolean => {
    // Remove non-numeric characters
    cpf = cpf.replace(/\D/g, '');
    
    // Check if it has 11 digits
    if (cpf.length !== 11) return false;
    
    // Check if all digits are the same
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format phone numbers by removing special characters and adding country code
    const formattedPatient = {
      ...patient,
      phone: `${phoneCountryCode}${patient.phone.replace(/\D/g, '')}`,
      cpf: patient.cpf.replace(/\D/g, ''),
      emergencyContact: {
        ...patient.emergencyContact,
        phone: `${emergencyPhoneCountryCode}${patient.emergencyContact.phone.replace(/\D/g, '')}`
      }
    };
    
    console.log('Form submitted:', formattedPatient);
    
    setLoading(true);
    
    // Send data to the specified endpoint
    fetch('https://n8n.c7tech.com.br/webhook/piscloud', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedPatient),
    })
      .then(response => {
        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
          // Handle specific HTTP status codes with more user-friendly messages
          if (response.status === 409) {
            throw new Error('Este paciente já está cadastrado no sistema.');
          } else if (response.status === 400) {
            throw new Error('Dados inválidos. Por favor, verifique as informações fornecidas.');
          } else if (response.status === 401 || response.status === 403) {
            throw new Error('Sem permissão para realizar esta operação.');
          } else if (response.status === 404) {
            throw new Error('Serviço não encontrado.');
          } else if (response.status === 500) {
            throw new Error('Erro interno do servidor. Por favor, tente novamente mais tarde.');
          } else {
            // Generic error for other status codes
            throw new Error(`Erro no servidor (${response.status}). Por favor, tente novamente.`);
          }
        }
        
        // Check if response has content before parsing JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return response.json().catch(error => {
            console.error('Error parsing JSON:', error);
            return { success: false, message: 'Erro ao processar resposta do servidor.' };
          });
        } else {
          // Handle empty or non-JSON responses
          console.log('Response is not JSON or is empty');
          return { success: true, message: 'Operação realizada com sucesso.' };
        }
      })
      .then(data => {
        console.log('Success:', data);
        
        // Check if the response contains a success flag
        if (data.success === false) {
          // If success is false, show the error message from the API
          setIsSuccess(false);
          setPopupMessage(data.message || 'Erro ao cadastrar paciente. Por favor, tente novamente.');
        } else {
          // If success is true or not specified, show success message
          setIsSuccess(true);
          setPopupMessage(data.message || 'Paciente cadastrado com sucesso!');
        }
        
        setShowPopup(true);
      })
      .catch(error => {
        console.error('Error submitting form:', error);
        setIsSuccess(false);
        setPopupMessage(`Erro ao cadastrar paciente: ${error.message}`);
        setShowPopup(true);
      })
      .finally(() => {
        setLoading(false);
      });
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

    // Validate CPF when it changes
    if (name === 'cpf') {
      const cpfValue = value.replace(/\D/g, '');
      if (cpfValue.length === 11) {
        if (!validateCPF(cpfValue)) {
          setCpfError('CPF inválido');
        } else {
          setCpfError('');
        }
      } else if (cpfValue.length > 0) {
        setCpfError('CPF deve ter 11 dígitos');
      } else {
        setCpfError('');
      }
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

                {/* Add CPF field here */}
                <div>
                  <label htmlFor="cpf" className="block text-sm font-medium text-gray-300">CPF</label>
                  <div className="mt-1 flex items-center">
                    <FileText className="w-5 h-5 text-gray-500 mr-2" />
                    <div className="w-full">
                      <InputMask
                        mask="999.999.999-99"
                        type="text"
                        id="cpf"
                        name="cpf"
                        value={patient.cpf}
                        onChange={handleInputChange}
                        required
                        className={`block w-full ${cpfError ? 'border-red-500' : ''}`}
                      />
                      {cpfError && (
                        <p className="mt-1 text-sm text-red-500">{cpfError}</p>
                      )}
                    </div>
                  </div>
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
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                    <option value="prefiro_nao_informar">Prefiro não informar</option>
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
                  <div className="flex items-center">
                    <div className="relative">
                      <button 
                        type="button"
                        className="flex items-center bg-gray-700 px-3 py-2 rounded-l-md border-r-0 border-gray-600"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      >
                        <span className="mr-1">
                          {countries.find(c => c.code === phoneCountryCode)?.flag || '🌎'}
                        </span>
                        <span className="text-gray-300">+{phoneCountryCode}</span>
                        <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
                      </button>
                      
                      {showCountryDropdown && (
                        <div className="absolute z-10 mt-1 w-48 bg-gray-800 rounded-md shadow-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60">
                          {countries.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                              onClick={() => {
                                setPhoneCountryCode(country.code);
                                setShowCountryDropdown(false);
                              }}
                            >
                              <span className="mr-2">{country.flag}</span>
                              <span>{country.name}</span>
                              <span className="ml-auto">+{country.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <InputMask
                      mask="(99) 99999-9999"
                      type="tel"
                      id="phone"
                      name="phone"
                      value={patient.phone}
                      onChange={handleInputChange}
                      required
                      className="mt-0 block w-full rounded-l-none"
                    />
                  </div>
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
                  <div className="flex items-center">
                    <div className="relative">
                      <button 
                        type="button"
                        className="flex items-center bg-gray-700 px-3 py-2 rounded-l-md border-r-0 border-gray-600"
                        onClick={() => setShowEmergencyCountryDropdown(!showEmergencyCountryDropdown)}
                      >
                        <span className="mr-1">
                          {countries.find(c => c.code === emergencyPhoneCountryCode)?.flag || '🌎'}
                        </span>
                        <span className="text-gray-300">+{emergencyPhoneCountryCode}</span>
                        <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
                      </button>
                      
                      {showEmergencyCountryDropdown && (
                        <div className="absolute z-10 mt-1 w-48 bg-gray-800 rounded-md shadow-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60">
                          {countries.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                              onClick={() => {
                                setEmergencyPhoneCountryCode(country.code);
                                setShowEmergencyCountryDropdown(false);
                              }}
                            >
                              <span className="mr-2">{country.flag}</span>
                              <span>{country.name}</span>
                              <span className="ml-auto">+{country.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <InputMask
                      mask="(99) 99999-9999"
                      type="tel"
                      id="emergencyContact.phone"
                      name="emergencyContact.phone"
                      value={patient.emergencyContact.phone}
                      onChange={handleInputChange}
                      required
                      className="mt-0 block w-full rounded-l-none"
                    />
                  </div>
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

      {/* Popup Message */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full shadow-xl">
            <div className={`text-center mb-4 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
              {isSuccess ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-4">
              {isSuccess ? 'Sucesso!' : 'Erro!'}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-center mb-6">
              {popupMessage}
            </p>
            <div className="text-center">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;