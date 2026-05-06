# SomCerto

**SomCerto** é um web app criado para ajudar pessoas a montar, validar e configurar projetos de som automotivo de forma mais simples, visual e segura.

A ideia nasceu de uma dor real: montar um som automotivo envolve várias decisões técnicas ao mesmo tempo — potência RMS, impedância, bobina simples ou dupla, canais de módulo, ligação em série/paralelo, cortes de frequência, caixa acústica, driver, médio, subwoofer, fonte e bateria.

Para quem está começando, tudo isso pode parecer confuso. O **SomCerto** busca transformar esse processo em uma experiência guiada, organizada e didática.

---

## Por que o SomCerto foi criado?

Muitas pessoas que montam som automotivo acabam dependendo de tentativa e erro, vídeos soltos, grupos de conversa ou opiniões diferentes para responder perguntas como:

- Esse módulo combina com esse subwoofer?
- A impedância final está correta?
- Posso ligar esse médio e esse driver no mesmo módulo?
- Um módulo mono serve para esse tipo de ligação?
- Como funciona um subwoofer 4+4 ohms ou 2+2 ohms?
- Quais cortes iniciais devo usar no sub, médio, driver ou tweeter?
- Minha caixa tem litragem adequada?
- Existe risco de queimar algum equipamento?

O objetivo do SomCerto é centralizar essas respostas em uma ferramenta prática, visual e acessível.

---

## Objetivo do projeto

O SomCerto tem como objetivo ajudar usuários iniciantes e intermediários a planejarem melhor seus projetos de som automotivo.

O app não substitui um instalador profissional, equipamentos de medição ou as especificações oficiais dos fabricantes, mas funciona como uma ferramenta de apoio para:

- organizar o projeto;
- cadastrar equipamentos;
- calcular impedância;
- analisar compatibilidade;
- sugerir configurações iniciais;
- calcular caixa acústica;
- identificar alertas importantes;
- reduzir erros comuns de montagem.

---

## Funcionalidades atuais

O MVP do SomCerto já possui uma base funcional com:

- **Projeto Guiado** para criação passo a passo;
- **cadastro de equipamentos** por tipo;
- **presets locais** de equipamentos;
- suporte a **bobina simples e bobina dupla**;
- cálculo de **impedância final**;
- suporte a **módulos mono e multicanais**;
- análise de compatibilidade automática;
- análise manual avançada;
- configuração inicial de cortes;
- calculadora de caixa acústica integrada ao projeto;
- medidor de dB inicial via navegador;
- dashboard inteligente do projeto;
- persistência local dos projetos no navegador.

---

## Projeto Guiado

O Projeto Guiado ajuda o usuário a montar seu sistema passo a passo.

Ele permite definir:

- nome do projeto;
- veículo;
- objetivo do som;
- tipos de equipamentos usados;
- equipamentos do projeto;
- ligações principais;
- análise inicial;
- configuração sugerida;
- resumo final.

A proposta é permitir que mesmo uma pessoa com pouco conhecimento técnico consiga organizar um projeto inicial com mais clareza.

---

## Compatibilidade

A área de compatibilidade analisa os equipamentos do projeto e ajuda a identificar possíveis problemas.

Ela considera pontos como:

- impedância final;
- potência RMS;
- tipo de módulo;
- quantidade de canais;
- ligação em série;
- ligação em paralelo;
- uso de bridge;
- módulos mono;
- módulos multicanais;
- dados técnicos incompletos.

A análise automática oferece uma visão inicial do projeto, enquanto a análise manual permite simular cenários específicos.

---

## Configuração de cortes

A tela de configuração sugere valores iniciais de corte para as vias do sistema, como:

- subwoofer;
- médio grave;
- driver;
- tweeter.

As sugestões podem incluir:

- HPF;
- LPF;
- slope;
- ganho inicial;
- fase;
- delay;
- observações de segurança.

Esses valores são apenas pontos de partida e não substituem ajuste profissional com medição.

---

## Calculadora de caixa

A calculadora de caixa ajuda a estimar o volume interno da caixa acústica.

Ela considera:

- largura;
- altura;
- profundidade;
- espessura da madeira;
- volume ocupado pelo falante;
- volume ocupado pelo duto;
- tipo de caixa;
- sintonia, quando aplicável.

O resultado pode ser salvo no projeto e usado como referência em outras etapas.

---

## Medidor de dB

O SomCerto possui uma ferramenta inicial de medição de dB pelo microfone do navegador.

Essa medição é aproximada e depende de fatores como:

- microfone do dispositivo;
- navegador;
- permissões do sistema;
- ambiente;
- calibração.

Ela serve como referência visual e comparativa, não como medição profissional calibrada.

---

## Dashboard do projeto

O dashboard funciona como o centro de controle do projeto.

Ele resume informações como:

- projeto ativo;
- quantidade de equipamentos;
- quantidade de falantes;
- quantidade de módulos;
- status de compatibilidade;
- status dos cortes;
- status da caixa;
- alertas principais;
- próxima ação recomendada.

A ideia é que o usuário saiba rapidamente o que já foi feito e o que ainda precisa revisar.

---

## Para quem é o SomCerto?

O SomCerto foi pensado para:

- pessoas montando o primeiro som automotivo;
- entusiastas de som;
- usuários que querem evitar erros de ligação;
- quem quer entender melhor RMS, impedância e canais;
- quem deseja planejar antes de comprar equipamentos;
- quem quer organizar um projeto completo de som.

---

## Status do projeto

O SomCerto ainda está em desenvolvimento.

A versão atual é um **MVP funcional**, criado para validar a ideia, testar o fluxo principal e evoluir as primeiras regras técnicas do produto.

Ainda existem melhorias planejadas, como:

- banco de dados real de equipamentos;
- catálogo de marcas e modelos;
- login de usuários;
- projetos salvos na nuvem;
- painel administrativo;
- exportação de projeto;
- melhorias no medidor de dB;
- versão PWA;
- futura versão mobile.

---

## Visão futura

A visão do SomCerto é evoluir para uma plataforma completa de apoio à montagem de som automotivo.

No futuro, o usuário poderá buscar equipamentos em um catálogo, adicionar ao projeto, visualizar compatibilidade, calcular caixa, configurar cortes, salvar tudo em sua conta e consultar o histórico dos seus sistemas.

A longo prazo, o objetivo é transformar o processo de montagem em algo mais claro, visual, educativo e seguro.

---

## Aviso importante

O SomCerto é uma ferramenta de apoio e aprendizado.

As sugestões geradas pelo app devem ser usadas como referência inicial. A instalação e regulagem final de um sistema de som automotivo devem considerar as especificações oficiais dos fabricantes, boas práticas de instalação e, quando possível, acompanhamento de um profissional qualificado.

Configurações incorretas podem causar danos aos equipamentos.

---

## Autor

Projeto desenvolvido por **Matheus Araujo Macedo**.

O SomCerto nasceu como um projeto pessoal de aprendizado, desenvolvimento web e aplicação prática de tecnologia em um problema real do universo de som automotivo.
