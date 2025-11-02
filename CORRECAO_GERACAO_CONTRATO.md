# Correção: Geração de Contrato em DOCX

## 📋 Problema Identificado

No código Admin original, a função `gerarContratoPDF` apresenta os seguintes problemas:
1. ❌ Gera PDF com formatação ruim
2. ❌ Não usa os templates configurados no "Editor de Contrato"
3. ❌ Informações do cliente incompletas
4. ❌ Documento pouco profissional

## ✅ Solução Implementada

A nova função `gerarContratoDocx`:
1. ✓ Carrega templates do banco de dados (`contrato_templates`)
2. ✓ Substitui variáveis pelos dados reais do cliente
3. ✓ Gera DOCX formatado profissionalmente
4. ✓ Inclui todas as informações do contratante
5. ✓ Usa biblioteca `docx.js` para geração

---

## 🔧 Instalação

### Passo 1: Adicionar biblioteca docx.js

No arquivo **Admin.html**, adicione no `<head>`:

```html
<!-- Substituir jsPDF por docx.js -->
<script src="https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
```

**Remova** a linha do jsPDF:
```html
<!-- REMOVER ESTA LINHA -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

---

## 📝 Código da Nova Função

### Substituir a função antiga

Localize a função `gerarContratoPDF` no código Admin (cerca da linha 500-520) e **substitua completamente** por:

```javascript
// NOVA FUNÇÃO - Gera contrato em DOCX com templates do banco
const gerarContratoDocx = async (proposta) => {
    try {
        // 1. Carregar templates do banco
        const { data: templates, error: templatesError } = await supabase
            .from('contrato_templates')
            .select('*')
            .order('ordem', { ascending: true });

        if (templatesError) {
            alert('Erro ao carregar templates do contrato: ' + templatesError.message);
            return;
        }

        if (!templates || templates.length === 0) {
            alert('⚠️ Nenhum template de contrato encontrado. Configure-os na aba "Editor de Contrato".');
            return;
        }

        // 2. Preparar dados do cliente para substituição
        const nomeCompleto = proposta.nome && proposta.sobrenome
            ? `${proposta.nome} ${proposta.sobrenome}`
            : proposta.nome_fantasia || 'Não informado';

        const cpfCnpj = proposta.tipo_pessoa === 'fisica'
            ? proposta.cpf || 'Não informado'
            : proposta.cnpj || 'Não informado';

        const enderecoCompleto = `${proposta.logradouro || ''}, ${proposta.numero_endereco || 's/n'}${proposta.complemento ? ', ' + proposta.complemento : ''}, ${proposta.bairro || ''}, ${proposta.cidade || ''} - ${proposta.estado || ''}, CEP: ${proposta.cep || ''}`;

        const dataAtual = new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        const formatarMoeda = (valor) => {
            const num = parseFloat(valor);
            if (isNaN(num)) return 'R$ 0,00';
            return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        };

        // Mapa de variáveis para substituição
        const variaveis = {
            '{{NUMERO_CONTRATO}}': proposta.numero_contrato || 'N/A',
            '{{DATA}}': dataAtual,
            '{{NOME_COMPLETO}}': nomeCompleto,
            '{{CPF_CNPJ}}': cpfCnpj,
            '{{RG}}': proposta.rg || 'Não informado',
            '{{EMAIL}}': proposta.email || 'Não informado',
            '{{TELEFONE}}': proposta.telefone || 'Não informado',
            '{{ENDERECO}}': enderecoCompleto,
            '{{LOGRADOURO}}': proposta.logradouro || '',
            '{{NUMERO}}': proposta.numero_endereco || '',
            '{{COMPLEMENTO}}': proposta.complemento || '',
            '{{BAIRRO}}': proposta.bairro || '',
            '{{CIDADE}}': proposta.cidade || '',
            '{{ESTADO}}': proposta.estado || '',
            '{{CEP}}': proposta.cep || '',
            '{{TIPO_PESSOA}}': proposta.tipo_pessoa === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica',
            '{{NOME_FANTASIA}}': proposta.nome_fantasia || '',
            '{{RAZAO_SOCIAL}}': proposta.razao_social || '',
            '{{DISTRIBUIDORA}}': proposta.distribuidora_energia || 'COPEL',
            '{{NUMERO_INSTALACAO}}': proposta.numero_instalacao || '',
            '{{CONSUMO_KWH}}': proposta.consumo_kwh || '0',
            '{{TIPO_CONEXAO}}': proposta.tipo_conexao || '',
            '{{ECONOMIA_MENSAL}}': formatarMoeda(proposta.simulacao_economia_mensal),
            '{{ECONOMIA_ANUAL}}': formatarMoeda(proposta.simulacao_economia_anual),
            '{{DESCONTO_PERCENTUAL}}': proposta.simulacao_desconto_percentual || '15',
            '{{CONTA_ATUAL}}': formatarMoeda(proposta.simulacao_conta_atual),
            '{{CONTA_NOVA}}': formatarMoeda(proposta.simulacao_conta_nova),
            '{{VENDEDOR}}': proposta.vendedor || 'Não informado'
        };

        // 3. Função para substituir variáveis no texto
        const substituirVariaveis = (texto) => {
            let textoProcessado = texto;
            Object.keys(variaveis).forEach(variavel => {
                const regex = new RegExp(variavel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                textoProcessado = textoProcessado.replace(regex, variaveis[variavel]);
            });
            return textoProcessado;
        };

        // 4. Criar documento DOCX usando docx.js
        const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = docx;

        const sections = [];

        // Cabeçalho do documento
        const headerParagraphs = [
            new Paragraph({
                text: 'OBY ENERGY',
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE ENERGIA',
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Contrato Nº: ${proposta.numero_contrato || 'N/A'}`,
                        bold: true
                    }),
                    new TextRun({
                        text: `        Data: ${dataAtual}`,
                        break: 0
                    })
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { after: 400 }
            })
        ];

        // Processar templates do banco
        const templateParagraphs = templates.map(template => {
            const textoProcessado = substituirVariaveis(template.texto);

            // Se for título/seção
            if (template.secao && template.secao.includes('TÍTULO')) {
                return new Paragraph({
                    text: textoProcessado,
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 400, after: 200 },
                    thematicBreak: true
                });
            }

            // Texto normal
            return new Paragraph({
                text: textoProcessado,
                spacing: { after: 200 },
                alignment: AlignmentType.JUSTIFIED
            });
        });

        // Seção de dados do contratante (sempre incluir)
        const dadosContratante = [
            new Paragraph({
                text: 'DADOS DO CONTRATANTE',
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 600, after: 300 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Nome/Razão Social: ', bold: true }),
                    new TextRun({ text: nomeCompleto })
                ],
                spacing: { after: 100 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: proposta.tipo_pessoa === 'fisica' ? 'CPF: ' : 'CNPJ: ', bold: true }),
                    new TextRun({ text: cpfCnpj })
                ],
                spacing: { after: 100 }
            })
        ];

        if (proposta.tipo_pessoa === 'fisica' && proposta.rg) {
            dadosContratante.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: 'RG: ', bold: true }),
                        new TextRun({ text: proposta.rg })
                    ],
                    spacing: { after: 100 }
                })
            );
        }

        dadosContratante.push(
            new Paragraph({
                children: [
                    new TextRun({ text: 'Endereço: ', bold: true }),
                    new TextRun({ text: enderecoCompleto })
                ],
                spacing: { after: 100 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'E-mail: ', bold: true }),
                    new TextRun({ text: proposta.email || 'Não informado' })
                ],
                spacing: { after: 100 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Telefone: ', bold: true }),
                    new TextRun({ text: proposta.telefone || 'Não informado' })
                ],
                spacing: { after: 100 }
            })
        );

        // Seção de dados da instalação
        const dadosInstalacao = [
            new Paragraph({
                text: 'DADOS DA INSTALAÇÃO',
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 600, after: 300 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Distribuidora: ', bold: true }),
                    new TextRun({ text: proposta.distribuidora_energia || 'COPEL' })
                ],
                spacing: { after: 100 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Número da Instalação: ', bold: true }),
                    new TextRun({ text: proposta.numero_instalacao || 'Não informado' })
                ],
                spacing: { after: 100 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Tipo de Conexão: ', bold: true }),
                    new TextRun({ text: (proposta.tipo_conexao || 'Não informado').toUpperCase() })
                ],
                spacing: { after: 100 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Consumo Médio Mensal: ', bold: true }),
                    new TextRun({ text: `${proposta.consumo_kwh || 0} kWh` })
                ],
                spacing: { after: 100 }
            })
        ];

        // Seção de benefícios econômicos
        const beneficios = [
            new Paragraph({
                text: 'BENEFÍCIOS ECONÔMICOS ESTIMADOS',
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 600, after: 300 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Economia Mensal Estimada: ', bold: true }),
                    new TextRun({ text: formatarMoeda(proposta.simulacao_economia_mensal), color: '0F9D58' })
                ],
                spacing: { after: 100 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Economia Anual Estimada: ', bold: true }),
                    new TextRun({ text: formatarMoeda(proposta.simulacao_economia_anual), color: '0F9D58' })
                ],
                spacing: { after: 100 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Desconto Aplicado: ', bold: true }),
                    new TextRun({ text: `${proposta.simulacao_desconto_percentual || 15}%` })
                ],
                spacing: { after: 100 }
            }),
            new Paragraph({
                text: '* Os valores apresentados são estimativas baseadas no consumo informado e podem variar conforme bandeiras tarifárias.',
                italics: true,
                spacing: { before: 200, after: 100 }
            })
        ];

        // Assinaturas
        const assinaturas = [
            new Paragraph({
                text: '',
                spacing: { before: 800, after: 800 }
            }),
            new Paragraph({
                text: '___________________________________',
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 }
            }),
            new Paragraph({
                text: nomeCompleto,
                alignment: AlignmentType.CENTER,
                spacing: { after: 50 }
            }),
            new Paragraph({
                text: 'CONTRATANTE',
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            }),
            new Paragraph({
                text: '___________________________________',
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 }
            }),
            new Paragraph({
                text: 'OBY ENERGY LTDA',
                alignment: AlignmentType.CENTER,
                spacing: { after: 50 }
            }),
            new Paragraph({
                text: 'CONTRATADA',
                alignment: AlignmentType.CENTER
            })
        ];

        // Montar documento completo
        const allParagraphs = [
            ...headerParagraphs,
            ...dadosContratante,
            ...dadosInstalacao,
            ...beneficios,
            ...templateParagraphs,
            ...assinaturas
        ];

        // 5. Criar documento
        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 1440,    // 1 inch = 1440 twips
                            right: 1440,
                            bottom: 1440,
                            left: 1440
                        }
                    }
                },
                children: allParagraphs
            }]
        });

        // 6. Gerar e baixar arquivo
        const blob = await Packer.toBlob(doc);
        const fileName = `Contrato_${nomeCompleto.replace(/\s+/g, '_')}_${proposta.numero_contrato || 'SemNumero'}.docx`;

        saveAs(blob, fileName);

        alert(`✅ Contrato gerado com sucesso!\n\nArquivo: ${fileName}`);

    } catch (error) {
        console.error('❌ Erro ao gerar contrato:', error);
        alert('Erro ao gerar contrato: ' + error.message);
    }
};
```

---

## 📍 Como Integrar no Admin.html

### 1. Localizar o botão de gerar contrato

Procure por algo parecido com:
```javascript
<button onClick={() => gerarContratoPDF(proposta)} className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
    📄 PDF
</button>
```

### 2. Substituir a chamada

Altere para:
```javascript
<button onClick={() => gerarContratoDocx(proposta)} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
    📄 DOCX
</button>
```

### 3. Remover função antiga

Remova completamente a função `gerarContratoPDF` antiga.

---

## 🎨 Variáveis Disponíveis para Templates

No "Editor de Contrato", você pode usar estas variáveis que serão substituídas automaticamente:

### Dados Pessoais
- `{{NOME_COMPLETO}}` - Nome completo ou nome fantasia
- `{{CPF_CNPJ}}` - CPF ou CNPJ conforme tipo de pessoa
- `{{RG}}` - RG do cliente
- `{{EMAIL}}` - Email do cliente
- `{{TELEFONE}}` - Telefone de contato
- `{{TIPO_PESSOA}}` - "Pessoa Física" ou "Pessoa Jurídica"

### Endereço
- `{{ENDERECO}}` - Endereço completo formatado
- `{{LOGRADOURO}}` - Apenas logradouro
- `{{NUMERO}}` - Número do endereço
- `{{COMPLEMENTO}}` - Complemento
- `{{BAIRRO}}` - Bairro
- `{{CIDADE}}` - Cidade
- `{{ESTADO}}` - UF
- `{{CEP}}` - CEP

### Dados da Instalação
- `{{DISTRIBUIDORA}}` - Nome da distribuidora
- `{{NUMERO_INSTALACAO}}` - Número de instalação
- `{{CONSUMO_KWH}}` - Consumo em kWh
- `{{TIPO_CONEXAO}}` - Tipo de conexão (mono/bi/trifásico)

### Valores Financeiros
- `{{ECONOMIA_MENSAL}}` - Economia mensal (R$ formatado)
- `{{ECONOMIA_ANUAL}}` - Economia anual (R$ formatado)
- `{{DESCONTO_PERCENTUAL}}` - Desconto aplicado (%)
- `{{CONTA_ATUAL}}` - Valor da conta atual (R$)
- `{{CONTA_NOVA}}` - Valor da nova conta (R$)

### Outros
- `{{NUMERO_CONTRATO}}` - Número do contrato
- `{{DATA}}` - Data de geração do contrato
- `{{VENDEDOR}}` - Nome do vendedor

---

## 📝 Exemplo de Template

No "Editor de Contrato", você pode criar templates como:

```
CLÁUSULA PRIMEIRA - DO OBJETO

O presente contrato tem como objeto a prestação de serviços de fornecimento de energia elétrica em regime de mercado livre para a instalação número {{NUMERO_INSTALACAO}},
localizada em {{ENDERECO}}, atualmente atendida pela {{DISTRIBUIDORA}}.

CLÁUSULA SEGUNDA - DO VALOR

O CONTRATANTE terá um benefício econômico estimado em {{ECONOMIA_MENSAL}} mensais,
correspondente a um desconto de {{DESCONTO_PERCENTUAL}}% sobre o valor da energia,
considerando o consumo médio de {{CONSUMO_KWH}} kWh/mês.

CLÁUSULA TERCEIRA - DA VIGÊNCIA

Este contrato terá vigência de 12 (doze) meses a partir da data de sua assinatura,
podendo ser renovado mediante acordo entre as partes.
```

---

## ✅ Benefícios da Nova Implementação

1. **Profissional**: Documento DOCX editável e bem formatado
2. **Dinâmico**: Usa templates configuráveis do banco
3. **Completo**: Inclui todos os dados do cliente e instalação
4. **Personalizável**: Editor de contrato permite ajustar cláusulas
5. **Automático**: Substitui todas as variáveis automaticamente
6. **Rastreável**: Número de contrato sempre presente

---

## 🧪 Como Testar

1. Acesse o painel Admin
2. Vá em uma proposta aprovada
3. Clique no botão "📄 DOCX"
4. Verifique que:
   - ✓ Arquivo baixou automaticamente
   - ✓ Nome do arquivo está correto
   - ✓ Documento abre no Word/LibreOffice
   - ✓ Todos os dados do cliente estão presentes
   - ✓ Variáveis foram substituídas
   - ✓ Formatação está profissional

---

## 🚨 Troubleshooting

### Erro: "Cannot read property 'Document' of undefined"
**Solução:** Verifique se adicionou corretamente a biblioteca docx.js no `<head>`

### Erro: "templates is null"
**Solução:** Configure os templates na aba "Editor de Contrato"

### Variáveis não estão sendo substituídas
**Solução:** Verifique se usou exatamente `{{VARIAVEL}}` (com chaves duplas)

### Arquivo não baixa
**Solução:** Verifique se incluiu a biblioteca FileSaver.js

---

## 📞 Suporte

Se tiver problemas:
1. Verifique o console do navegador (F12)
2. Confirme que as bibliotecas foram carregadas
3. Teste com uma proposta que tenha todos os dados preenchidos

---

**Última atualização:** 02/11/2025
**Versão:** 2.0
