# Exemplos de Correções - OBY Energy

Este documento contém exemplos práticos de como corrigir os principais problemas identificados.

---

## 🔐 1. CORREÇÃO: Segurança de Credenciais

### ❌ ANTES (INSEGURO):
```javascript
// Hardcoded no código
const SUPABASE_URL = 'https://uuaqmwnfjopgjmjjchmw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'oby2025';
```

### ✅ DEPOIS (SEGURO):

**1. Criar arquivo `.env.local`:**
```bash
VITE_SUPABASE_URL=https://uuaqmwnfjopgjmjjchmw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**2. Criar arquivo de configuração:**
```typescript
// src/config/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**3. Adicionar `.env.local` ao `.gitignore`:**
```bash
# .gitignore
.env.local
.env.*.local
```

**4. Criar `.env.example` para documentação:**
```bash
# .env.example
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 🔐 2. CORREÇÃO: Autenticação Real

### ❌ ANTES (INSEGURO):
```javascript
const handleLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        setIsAuthenticated(true);
        localStorage.setItem('oby_admin_auth', 'true');
    }
};
```

### ✅ DEPOIS (SEGURO):

**1. Implementar Supabase Auth:**
```typescript
// src/services/auth.service.ts
import { supabase } from '../config/supabase';

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async checkIsAdmin(userId: string) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return false;
    return !!data;
  }
};
```

**2. Componente de Login Seguro:**
```typescript
// src/components/AdminLogin.tsx
import { useState } from 'react';
import { authService } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user } = await authService.login(email, password);

      // Verificar se é admin
      const isAdmin = await authService.checkIsAdmin(user.id);
      if (!isAdmin) {
        await authService.logout();
        throw new Error('Acesso negado: Usuário não é administrador');
      }

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 border rounded-lg"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
```

**3. Proteção de Rotas:**
```typescript
// src/components/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { supabase } from '../config/supabase';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setIsAdmin(false);
        } else if (event === 'SIGNED_IN' && session?.user) {
          const admin = await authService.checkIsAdmin(session.user.id);
          setIsAdmin(admin);
          setIsAuthenticated(true);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const admin = await authService.checkIsAdmin(user.id);
        setIsAdmin(admin);
        setIsAuthenticated(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
```

**4. Configurar RLS no Supabase:**
```sql
-- Habilitar RLS na tabela propostas
ALTER TABLE propostas ENABLE ROW LEVEL SECURITY;

-- Política: Admin pode ver tudo
CREATE POLICY "Admins podem ver todas as propostas"
ON propostas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);

-- Política: Admin pode editar tudo
CREATE POLICY "Admins podem editar todas as propostas"
ON propostas FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);

-- Política: Vendedores podem criar propostas
CREATE POLICY "Vendedores podem criar propostas"
ON propostas FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vendedores
    WHERE vendedores.user_id = auth.uid()
    AND vendedores.status = 'ativo'
  )
);
```

---

## 📝 3. CORREÇÃO: Validação de Formulários

### ❌ ANTES:
```javascript
if (!formData.cpf) newErrors.cpf = 'Campo obrigatório';
```

### ✅ DEPOIS:

**1. Instalar dependências:**
```bash
npm install zod react-hook-form @hookform/resolvers react-input-mask
```

**2. Criar schema de validação:**
```typescript
// src/schemas/proposta.schema.ts
import { z } from 'zod';

// Função para validar CPF
function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digito1 = resto >= 10 ? 0 : resto;

  if (parseInt(cpf.charAt(9)) !== digito1) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digito2 = resto >= 10 ? 0 : resto;

  return parseInt(cpf.charAt(10)) === digito2;
}

// Função para validar CNPJ
function validarCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]/g, '');

  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1));
}

export const propostaSchema = z.object({
  // Dados pessoais
  vendedor: z.string().min(1, 'Selecione um vendedor'),

  nome: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),

  sobrenome: z.string()
    .min(2, 'Sobrenome deve ter no mínimo 2 caracteres')
    .max(100, 'Sobrenome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Sobrenome deve conter apenas letras'),

  email: z.string()
    .email('Email inválido')
    .toLowerCase(),

  telefone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido. Use: (00) 00000-0000'),

  cpf: z.string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido. Use: 000.000.000-00')
    .refine(validarCPF, 'CPF inválido'),

  cnpj: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido. Use: 00.000.000/0000-00')
    .refine(validarCNPJ, 'CNPJ inválido')
    .optional(),

  // Endereço
  cep: z.string()
    .regex(/^\d{5}-\d{3}$/, 'CEP inválido. Use: 00000-000'),

  logradouro: z.string().min(3, 'Logradouro inválido'),
  numeroEndereco: z.string().min(1, 'Número é obrigatório'),
  bairro: z.string().min(2, 'Bairro inválido'),
  cidade: z.string().min(2, 'Cidade inválida'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres'),

  // Instalação
  consumoKW: z.number()
    .min(1, 'Consumo deve ser maior que zero')
    .max(999999, 'Consumo muito alto'),

  tipoConexao: z.enum(['monofasico', 'bifasico', 'trifasico'], {
    errorMap: () => ({ message: 'Selecione um tipo de conexão' })
  }),

  numeroInstalacao: z.string()
    .min(5, 'Número de instalação inválido')
    .max(20, 'Número de instalação muito longo'),

  // Arquivos
  arquivoConta: z.instanceof(File, { message: 'Conta de energia é obrigatória' })
    .refine((file) => file.size <= 10 * 1024 * 1024, 'Arquivo deve ter no máximo 10MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type),
      'Formato inválido. Use: JPG, PNG ou PDF'
    ),
});

export type PropostaFormData = z.infer<typeof propostaSchema>;
```

**3. Usar no componente:**
```typescript
// src/components/PropostaForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { propostaSchema, PropostaFormData } from '../schemas/proposta.schema';
import InputMask from 'react-input-mask';

export function PropostaForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<PropostaFormData>({
    resolver: zodResolver(propostaSchema),
  });

  const onSubmit = async (data: PropostaFormData) => {
    try {
      // Enviar dados
      console.log('Dados válidos:', data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* CPF com máscara */}
      <div>
        <label className="block text-sm font-medium mb-2">CPF *</label>
        <InputMask
          mask="999.999.999-99"
          {...register('cpf')}
          className={`w-full p-3 border rounded-lg ${
            errors.cpf ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.cpf && (
          <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>
        )}
      </div>

      {/* Telefone com máscara */}
      <div>
        <label className="block text-sm font-medium mb-2">Telefone *</label>
        <InputMask
          mask="(99) 99999-9999"
          {...register('telefone')}
          className={`w-full p-3 border rounded-lg ${
            errors.telefone ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.telefone && (
          <p className="text-red-500 text-sm mt-1">{errors.telefone.message}</p>
        )}
      </div>

      {/* Consumo com validação numérica */}
      <div>
        <label className="block text-sm font-medium mb-2">Consumo (kWh) *</label>
        <input
          type="number"
          {...register('consumoKW', { valueAsNumber: true })}
          className={`w-full p-3 border rounded-lg ${
            errors.consumoKW ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.consumoKW && (
          <p className="text-red-500 text-sm mt-1">{errors.consumoKW.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar Proposta'}
      </button>
    </form>
  );
}
```

---

## 🧮 4. CORREÇÃO: Cálculo de Simulação

### ❌ ANTES:
```javascript
const calcularSimulacao = async () => {
    const consumoExcedente = consumo - minimo;
    // Não valida se consumo < minimo!
};
```

### ✅ DEPOIS:

**1. Criar serviço de cálculo:**
```typescript
// src/services/simulacao.service.ts
import Decimal from 'decimal.js';

export interface ConfiguracaoTarifa {
  tarifaTotal: number;
  tarifaEnergia: number;
  tarifaImpostos: number;
  descontoPercentual: number;
  consumoMinimo: {
    monofasico: number;
    bifasico: number;
    trifasico: number;
  };
}

export interface ResultadoSimulacao {
  contaAtual: string;
  contaNova: string;
  economiaMensal: string;
  economiaAnual: string;
  desconto: string;
  consumo: number;
  minimo: number;
  consumoMinimoValor: string;
  impostosNaoCompensaveis: string;
  energiaCativaAtual: string;
  energiaCativaComDesconto: string;
  contasPorAno: string;
}

export class SimulacaoService {
  private config: ConfiguracaoTarifa;

  constructor(config: ConfiguracaoTarifa) {
    this.config = config;
    Decimal.set({ precision: 10, rounding: Decimal.ROUND_HALF_UP });
  }

  calcular(
    consumoKwh: number,
    tipoConexao: 'monofasico' | 'bifasico' | 'trifasico'
  ): ResultadoSimulacao {
    // Validações
    if (consumoKwh <= 0) {
      throw new Error('Consumo deve ser maior que zero');
    }

    const minimo = this.config.consumoMinimo[tipoConexao];

    if (consumoKwh < minimo) {
      throw new Error(
        `Consumo mínimo para ${tipoConexao} é ${minimo} kWh. Consumo informado: ${consumoKwh} kWh`
      );
    }

    // Usar Decimal.js para precisão
    const consumo = new Decimal(consumoKwh);
    const minimoDecimal = new Decimal(minimo);
    const tarifaTotal = new Decimal(this.config.tarifaTotal);
    const tarifaEnergia = new Decimal(this.config.tarifaEnergia);
    const tarifaImpostos = new Decimal(this.config.tarifaImpostos);
    const desconto = new Decimal(this.config.descontoPercentual).div(100);

    // Cálculos
    const consumoMinimoValor = minimoDecimal.mul(tarifaTotal);
    const consumoExcedente = consumo.sub(minimoDecimal);

    // Garantir que não há valores negativos
    if (consumoExcedente.lessThan(0)) {
      throw new Error('Erro no cálculo: consumo excedente negativo');
    }

    const impostosNaoCompensaveis = consumoExcedente.mul(tarifaImpostos);
    const energiaCativaAtual = consumoExcedente.mul(tarifaEnergia);
    const contaAtual = consumoMinimoValor
      .plus(impostosNaoCompensaveis)
      .plus(energiaCativaAtual);

    const tarifaEnergiaComDesconto = tarifaEnergia.mul(
      new Decimal(1).sub(desconto)
    );
    const energiaCativaComDesconto = consumoExcedente.mul(tarifaEnergiaComDesconto);
    const contaNova = consumoMinimoValor
      .plus(impostosNaoCompensaveis)
      .plus(energiaCativaComDesconto);

    const economiaMensal = contaAtual.sub(contaNova);
    const economiaAnual = economiaMensal.mul(12);

    // Cálculo de contas por ano
    let contasPorAno = new Decimal(12);
    if (contaAtual.greaterThan(0)) {
      contasPorAno = new Decimal(12).sub(economiaAnual.div(contaAtual));
    }

    // Validações finais
    if (economiaMensal.lessThan(0)) {
      throw new Error('Erro: economia calculada é negativa. Verifique as configurações.');
    }

    // Retornar com 2 casas decimais
    return {
      contaAtual: contaAtual.toFixed(2),
      contaNova: contaNova.toFixed(2),
      economiaMensal: economiaMensal.toFixed(2),
      economiaAnual: economiaAnual.toFixed(2),
      desconto: this.config.descontoPercentual.toFixed(0),
      consumo: consumoKwh,
      minimo,
      consumoMinimoValor: consumoMinimoValor.toFixed(2),
      impostosNaoCompensaveis: impostosNaoCompensaveis.toFixed(2),
      energiaCativaAtual: energiaCativaAtual.toFixed(2),
      energiaCativaComDesconto: energiaCativaComDesconto.toFixed(2),
      contasPorAno: contasPorAno.toFixed(2),
    };
  }
}
```

**2. Testes unitários:**
```typescript
// src/services/__tests__/simulacao.service.test.ts
import { describe, it, expect } from 'vitest';
import { SimulacaoService } from '../simulacao.service';

describe('SimulacaoService', () => {
  const config = {
    tarifaTotal: 0.842355,
    tarifaEnergia: 0.682308,
    tarifaImpostos: 0.160047,
    descontoPercentual: 15,
    consumoMinimo: {
      monofasico: 30,
      bifasico: 50,
      trifasico: 100,
    },
  };

  const service = new SimulacaoService(config);

  it('deve calcular simulação corretamente para trifásico', () => {
    const resultado = service.calcular(250, 'trifasico');

    expect(parseFloat(resultado.consumo)).toBe(250);
    expect(parseFloat(resultado.economiaMensal)).toBeGreaterThan(0);
    expect(parseFloat(resultado.contaNova)).toBeLessThan(
      parseFloat(resultado.contaAtual)
    );
  });

  it('deve lançar erro se consumo menor que mínimo', () => {
    expect(() => service.calcular(50, 'trifasico')).toThrow(
      'Consumo mínimo para trifasico é 100 kWh'
    );
  });

  it('deve lançar erro se consumo for zero', () => {
    expect(() => service.calcular(0, 'monofasico')).toThrow(
      'Consumo deve ser maior que zero'
    );
  });

  it('deve lançar erro se consumo for negativo', () => {
    expect(() => service.calcular(-100, 'monofasico')).toThrow(
      'Consumo deve ser maior que zero'
    );
  });

  it('deve calcular economia anual corretamente', () => {
    const resultado = service.calcular(150, 'bifasico');
    const economiaAnualCalculada = parseFloat(resultado.economiaMensal) * 12;

    expect(parseFloat(resultado.economiaAnual)).toBeCloseTo(
      economiaAnualCalculada,
      2
    );
  });

  it('deve retornar valores com 2 casas decimais', () => {
    const resultado = service.calcular(200, 'trifasico');

    expect(resultado.contaAtual).toMatch(/^\d+\.\d{2}$/);
    expect(resultado.contaNova).toMatch(/^\d+\.\d{2}$/);
    expect(resultado.economiaMensal).toMatch(/^\d+\.\d{2}$/);
  });
});
```

---

## 📤 5. CORREÇÃO: Upload de Arquivos

### ❌ ANTES:
```javascript
const uploadFile = async (file, folder) => {
    const fileName = `${Date.now()}_${file.name}`; // Previsível
    // Sem validação server-side
};
```

### ✅ DEPOIS:

**1. Criar serviço de upload:**
```typescript
// src/services/upload.service.ts
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/jpg'],
  pdf: ['application/pdf'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export class UploadService {
  /**
   * Valida o tipo MIME real do arquivo (magic numbers)
   */
  private async validateFileMimeType(file: File, allowedTypes: string[]): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const arr = new Uint8Array(e.target?.result as ArrayBuffer);
        let header = '';

        for (let i = 0; i < Math.min(arr.length, 4); i++) {
          header += arr[i].toString(16);
        }

        // JPEG
        if (header.startsWith('ffd8ff')) {
          resolve(allowedTypes.includes('image/jpeg'));
          return;
        }

        // PNG
        if (header.startsWith('89504e47')) {
          resolve(allowedTypes.includes('image/png'));
          return;
        }

        // PDF
        if (header.startsWith('25504446')) {
          resolve(allowedTypes.includes('application/pdf'));
          return;
        }

        resolve(false);
      };

      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  }

  /**
   * Faz upload de arquivo com validações
   */
  async uploadFile(
    file: File,
    folder: 'contas' | 'documentos',
    allowedTypes: 'image' | 'pdf' | 'both' = 'both'
  ): Promise<string> {
    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Validar tipo declarado
    const allowedMimeTypes = allowedTypes === 'both'
      ? [...ALLOWED_MIME_TYPES.image, ...ALLOWED_MIME_TYPES.pdf]
      : ALLOWED_MIME_TYPES[allowedTypes];

    if (!allowedMimeTypes.includes(file.type)) {
      throw new Error(
        `Tipo de arquivo não permitido. Permitidos: ${allowedMimeTypes.join(', ')}`
      );
    }

    // Validar tipo real (magic numbers)
    const isValidMimeType = await this.validateFileMimeType(file, allowedMimeTypes);
    if (!isValidMimeType) {
      throw new Error('Arquivo corrompido ou tipo real diferente do declarado');
    }

    // Gerar nome único com UUID
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    // Upload para Supabase Storage
    const { data, error } = await supabase.storage
      .from('propostas')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Erro no upload:', error);
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }

    // Retornar URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('propostas')
      .getPublicUrl(filePath);

    return publicUrl;
  }

  /**
   * Faz upload de múltiplos arquivos em paralelo
   */
  async uploadMultiple(
    files: Array<{
      file: File;
      folder: 'contas' | 'documentos';
      allowedTypes?: 'image' | 'pdf' | 'both';
    }>
  ): Promise<string[]> {
    const uploadPromises = files.map((item) =>
      this.uploadFile(item.file, item.folder, item.allowedTypes)
    );

    try {
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      // Se algum upload falhar, tentar limpar os que deram certo
      // (implementar lógica de rollback se necessário)
      throw error;
    }
  }

  /**
   * Deleta arquivo
   */
  async deleteFile(fileUrl: string): Promise<void> {
    // Extrair path do URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(-2).join('/'); // folder/filename

    const { error } = await supabase.storage
      .from('propostas')
      .remove([filePath]);

    if (error) {
      console.error('Erro ao deletar arquivo:', error);
      throw new Error(`Erro ao deletar arquivo: ${error.message}`);
    }
  }
}

export const uploadService = new UploadService();
```

**2. Componente de upload com preview:**
```typescript
// src/components/FileUpload.tsx
import { useState } from 'react';
import { uploadService } from '../services/upload.service';

interface FileUploadProps {
  label: string;
  folder: 'contas' | 'documentos';
  allowedTypes?: 'image' | 'pdf' | 'both';
  onUploadComplete: (url: string) => void;
  onError: (error: string) => void;
}

export function FileUpload({
  label,
  folder,
  allowedTypes = 'both',
  onUploadComplete,
  onError,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Criar preview para imagens
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      // Simular progresso (Supabase não retorna progresso real)
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const url = await uploadService.uploadFile(file, folder, allowedTypes);

      clearInterval(interval);
      setProgress(100);
      onUploadComplete(url);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setProgress(0);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-2">{label}</label>

      {!file ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            onChange={handleFileChange}
            accept={allowedTypes === 'image' ? 'image/*' : allowedTypes === 'pdf' ? '.pdf' : 'image/*,.pdf'}
            className="hidden"
            id={`file-upload-${label}`}
          />
          <label
            htmlFor={`file-upload-${label}`}
            className="cursor-pointer text-blue-600 hover:text-blue-700"
          >
            Clique para selecionar arquivo
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Formatos: {allowedTypes === 'image' ? 'JPG, PNG' : allowedTypes === 'pdf' ? 'PDF' : 'JPG, PNG, PDF'}
            {' • '}Máx: 10MB
          </p>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4">
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded mb-4"
            />
          )}

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium truncate">{file.name}</span>
            <button
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Remover
            </button>
          </div>

          <div className="text-sm text-gray-500 mb-3">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </div>

          {uploading && (
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">{progress}%</p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {uploading ? 'Enviando...' : 'Fazer Upload'}
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 6. CORREÇÃO: UX com Toast Notifications

### ❌ ANTES:
```javascript
alert('✅ Proposta salva com sucesso!');
```

### ✅ DEPOIS:

**1. Instalar:**
```bash
npm install sonner
```

**2. Configurar:**
```typescript
// src/App.tsx
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      {/* Resto da aplicação */}
    </>
  );
}
```

**3. Usar:**
```typescript
import { toast } from 'sonner';

// Sucesso
toast.success('Proposta salva com sucesso!');

// Erro
toast.error('Erro ao salvar proposta', {
  description: error.message,
});

// Loading
const toastId = toast.loading('Enviando arquivos...');
// Depois
toast.success('Arquivos enviados!', { id: toastId });

// Com ação
toast.success('Proposta salva!', {
  action: {
    label: 'Ver',
    onClick: () => navigate('/propostas/123'),
  },
});
```

---

## 📁 ESTRUTURA DE PROJETO RECOMENDADA

```
oby-energy/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── PropostasList.tsx
│   │   │   ├── PropostaEditModal.tsx
│   │   │   ├── VendedoresGestao.tsx
│   │   │   └── FinancialReport.tsx
│   │   ├── form/
│   │   │   ├── PropostaForm.tsx
│   │   │   ├── SimulacaoResult.tsx
│   │   │   └── FileUpload.tsx
│   │   └── shared/
│   │       ├── ProtectedRoute.tsx
│   │       ├── Loading.tsx
│   │       └── ErrorBoundary.tsx
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── propostas.service.ts
│   │   ├── vendedores.service.ts
│   │   ├── upload.service.ts
│   │   └── simulacao.service.ts
│   ├── hooks/
│   │   ├── usePropostas.ts
│   │   ├── useVendedores.ts
│   │   └── useAuth.ts
│   ├── schemas/
│   │   ├── proposta.schema.ts
│   │   └── vendedor.schema.ts
│   ├── types/
│   │   ├── proposta.ts
│   │   └── vendedor.ts
│   ├── config/
│   │   └── supabase.ts
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   ├── App.tsx
│   └── main.tsx
├── .env.local
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

Esta documentação fornece exemplos práticos e completos de como corrigir os principais problemas identificados. Recomenda-se implementar as correções de forma incremental, priorizando segurança primeiro.
