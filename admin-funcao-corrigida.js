// ====================================================================
// FUNÇÃO CORRIGIDA: gerarContratoDocx
// ====================================================================
//
// INSTRUÇÕES:
// 1. Localize a função antiga "gerarContratoPDF" no seu Admin.html
// 2. DELETE completamente a função antiga
// 3. COPIE e COLE esta função no mesmo lugar
// 4. Atualize o botão para chamar gerarContratoDocx ao invés de gerarContratoPDF
//
// ====================================================================

const gerarContratoDocx = async (proposta) => {
    try {
        console.log('🚀 Iniciando geração de contrato DOCX...');

        // 1. Carregar templates do banco de dados
        const response = await fetch(`${SUPABASE_URL}/rest/v1/contrato_templates?select=*&order=ordem.asc`, {
            headers: {
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'apikey': SUPABASE_KEY
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar templates do contrato');
        }

        const templates = await response.json();

        if (!templates || templates.length === 0) {
            alert('⚠️ Nenhum template de contrato encontrado.\n\nConfigure os templates na aba "Editor de Contrato" antes de gerar o contrato.');
            return;
        }

        console.log(`✅ ${templates.length} templates carregados`);

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

        // 3. Mapa de variáveis para substituição automática
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
            '{{TIPO_CONEXAO}}': (proposta.tipo_conexao || '').toUpperCase(),
            '{{ECONOMIA_MENSAL}}': formatarMoeda(proposta.simulacao_economia_mensal),
            '{{ECONOMIA_ANUAL}}': formatarMoeda(proposta.simulacao_economia_anual),
            '{{DESCONTO_PERCENTUAL}}': proposta.simulacao_desconto_percentual || '15',
            '{{CONTA_ATUAL}}': formatarMoeda(proposta.simulacao_conta_atual),
            '{{CONTA_NOVA}}': formatarMoeda(proposta.simulacao_conta_nova),
            '{{VENDEDOR}}': proposta.vendedor || 'Não informado'
        };

        // 4. Função para substituir variáveis no texto
        const substituirVariaveis = (texto) => {
            let textoProcessado = texto;
            Object.keys(variaveis).forEach(variavel => {
                const regex = new RegExp(variavel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                textoProcessado = textoProcessado.replace(regex, variaveis[variavel]);
            });
            return textoProcessado;
        };

        // 5. Criar documento DOCX usando docx.js
        const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;

        console.log('📄 Criando estrutura do documento...');

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

        // Processar templates do banco e substituir variáveis
        const templateParagraphs = templates.flatMap(template => {
            const textoProcessado = substituirVariaveis(template.texto);
            const linhas = textoProcessado.split('\n').filter(linha => linha.trim());

            return linhas.map((linha, idx) => {
                // Se for título de cláusula
                if (idx === 0 && (linha.includes('CLÁUSULA') || linha.includes('TÍTULO'))) {
                    return new Paragraph({
                        text: linha,
                        heading: HeadingLevel.HEADING_3,
                        spacing: { before: 400, after: 200 }
                    });
                }
                // Texto normal
                return new Paragraph({
                    text: linha,
                    spacing: { after: 150 },
                    alignment: AlignmentType.JUSTIFIED
                });
            });
        });

        // Seção de dados do contratante
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

        // Adicionar RG se pessoa física
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

        // Adicionar demais dados
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
                    new TextRun({
                        text: formatarMoeda(proposta.simulacao_economia_mensal),
                        color: '0F9D58',
                        bold: true
                    })
                ],
                spacing: { after: 100 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Economia Anual Estimada: ', bold: true }),
                    new TextRun({
                        text: formatarMoeda(proposta.simulacao_economia_anual),
                        color: '0F9D58',
                        bold: true
                    })
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
                children: [
                    new TextRun({ text: 'Valor Conta Atual: ', bold: true }),
                    new TextRun({ text: formatarMoeda(proposta.simulacao_conta_atual) })
                ],
                spacing: { after: 100 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Valor Conta com OBY: ', bold: true }),
                    new TextRun({ text: formatarMoeda(proposta.simulacao_conta_nova) })
                ],
                spacing: { after: 100 }
            }),
            new Paragraph({
                text: '* Os valores apresentados são estimativas baseadas no consumo informado e podem variar conforme bandeiras tarifárias vigentes.',
                italics: true,
                spacing: { before: 200, after: 100 }
            })
        ];

        // Seção de assinaturas
        const assinaturas = [
            new Paragraph({
                text: '',
                spacing: { before: 800, after: 800 }
            }),
            new Paragraph({
                text: '___________________________________________',
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
                bold: true,
                spacing: { after: 600 }
            }),
            new Paragraph({
                text: '___________________________________________',
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
                alignment: AlignmentType.CENTER,
                bold: true
            })
        ];

        // 6. Montar documento completo
        const allParagraphs = [
            ...headerParagraphs,
            ...dadosContratante,
            ...dadosInstalacao,
            ...beneficios,
            ...templateParagraphs,
            ...assinaturas
        ];

        console.log(`📦 Documento com ${allParagraphs.length} parágrafos criado`);

        // 7. Criar documento DOCX
        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 1440,    // 1 polegada = 1440 twips
                            right: 1440,
                            bottom: 1440,
                            left: 1440
                        }
                    }
                },
                children: allParagraphs
            }]
        });

        // 8. Gerar blob e baixar arquivo
        console.log('💾 Gerando arquivo DOCX...');
        const blob = await Packer.toBlob(doc);

        // Nome do arquivo
        const fileName = `Contrato_${nomeCompleto.replace(/\s+/g, '_')}_${proposta.numero_contrato || 'SemNumero'}.docx`;

        // Baixar arquivo
        console.log('⬇️ Baixando:', fileName);
        saveAs(blob, fileName);

        // Feedback de sucesso
        alert(`✅ Contrato gerado com sucesso!\n\n📄 Arquivo: ${fileName}\n\nVerifique seus downloads.`);
        console.log('✅ Contrato DOCX gerado com sucesso!');

    } catch (error) {
        console.error('❌ Erro ao gerar contrato:', error);
        alert(`❌ Erro ao gerar contrato:\n\n${error.message}\n\nVerifique o console (F12) para mais detalhes.`);
    }
};
