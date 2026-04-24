# SomCerto

**SomCerto** é um web app criado para ajudar pessoas a montar, validar e configurar projetos de som automotivo de forma mais simples, segura e inteligente.

A ideia nasceu a partir de uma dor real: quem está montando um som automotivo geralmente precisa lidar com várias dúvidas técnicas ao mesmo tempo, como potência RMS, impedância, canais de módulo, bobina simples ou dupla, cortes de frequência, caixa acústica, drivers, médios, subwoofers e fontes. Para quem está começando, tudo isso pode parecer confuso e aumentar o risco de comprar equipamentos errados ou configurar o sistema de forma insegura.

O SomCerto busca transformar esse processo em uma experiência guiada, visual e didática.

---

## Por que o SomCerto foi criado?

A criação do SomCerto veio da necessidade de ter uma ferramenta que ajudasse o usuário a responder perguntas comuns na montagem de um projeto de som, como:

- Esse módulo combina com esse subwoofer?
- A impedância final está correta?
- Posso ligar esse médio e esse driver no mesmo módulo?
- Meu módulo é mono ou multicanal?
- Como funciona bobina dupla 4+4 ou 2+2 ohms?
- Quais cortes iniciais posso usar no sub, médio, driver ou tweeter?
- Minha caixa tem litragem adequada?
- O projeto apresenta algum risco de queima ou ligação incorreta?

Muitas dessas dúvidas normalmente são respondidas por tentativa e erro, vídeos soltos na internet ou opiniões em grupos. O objetivo do SomCerto é centralizar essas informações em uma ferramenta prática, organizada e acessível.

---

## Objetivo do projeto

O objetivo principal do SomCerto é ajudar usuários iniciantes e intermediários a planejar melhor seus projetos de som automotivo.

O app não substitui um instalador profissional, um técnico em áudio ou equipamentos de medição, mas serve como uma ferramenta de apoio para:

- organizar o projeto;
- entender os equipamentos;
- evitar erros básicos;
- calcular impedância;
- analisar compatibilidade;
- sugerir configurações iniciais;
- calcular caixa acústica;
- visualizar alertas importantes.

---

## Funcionalidades atuais

O SomCerto já conta com uma base funcional de MVP, incluindo:

- criação de projeto guiado;
- cadastro de equipamentos;
- presets locais de equipamentos;
- suporte a bobina simples e bobina dupla;
- cálculo de impedância final;
- análise de compatibilidade automática;
- análise manual avançada;
- suporte a módulos mono e multicanais;
- configuração inicial de cortes;
- calculadora de caixa acústica;
- medidor de dB inicial;
- dashboard do projeto;
- salvamento local dos projetos no navegador.

---

## Projeto Guiado

O Projeto Guiado ajuda o usuário a criar seu sistema passo a passo.

Ele permite informar:

- nome do projeto;
- veículo;
- objetivo do som;
- tipos de equipamentos que farão parte do sistema;
- equipamentos usados;
- ligações principais;
- análise inicial;
- configuração sugerida;
- resumo final.

A proposta é facilitar a criação de um projeto mesmo para quem ainda não domina todos os conceitos técnicos.

---

## Compatibilidade

A área de compatibilidade analisa os equipamentos do projeto e ajuda a identificar possíveis problemas.

Ela considera fatores como:

- impedância final;
- potência RMS;
- tipo de módulo;
- quantidade de canais;
- módulos mono;
- módulos multicanais;
- ligações por canal;
- ligações em série ou paralelo;
- uso de bridge;
- dados técnicos incompletos.

A análise automática oferece uma visão inicial do projeto, enquanto a análise manual permite ajustes mais específicos.

---

## Configuração de cortes

A tela de configuração de cortes sugere valores iniciais para cada via do sistema, como:

- subwoofer;
- médio grave;
- driver;
- tweeter.

Ela pode sugerir valores como HPF, LPF, slope, ganho inicial, fase e delay.

Essas sugestões funcionam como ponto de partida e não substituem ajuste profissional com medição.

---

## Calculadora de caixa

A calculadora de caixa ajuda o usuário a calcular o volume interno aproximado da caixa acústica.

Ela considera:

- largura;
- altura;
- profundidade;
- espessura da madeira;
- volume ocupado pelo falante;
- volume ocupado pelo duto;
- tipo de caixa;
- sintonia, quando aplicável.

O resultado pode ser salvo no projeto para ser usado como referência em outras etapas.

---

## Medidor de dB

O SomCerto também possui uma ferramenta inicial de medição de dB pelo microfone do navegador.

Essa medição é aproximada e depende do aparelho, do microfone, do navegador e das permissões do sistema.

Ela serve como referência visual e comparativa, não como medição profissional calibrada.

---

## Para quem é o SomCerto?

O SomCerto foi pensado para:

- pessoas montando o primeiro som automotivo;
- entusiastas de som;
- usuários que querem evitar erros de ligação;
- pessoas que querem entender melhor RMS, impedância e canais;
- quem quer planejar melhor antes de comprar equipamentos;
- quem quer organizar um projeto completo de som.

---

## Status do projeto

O SomCerto ainda está em desenvolvimento.

A versão atual é um MVP funcional, com foco em validar a ideia, organizar o fluxo principal e testar as regras técnicas iniciais.

Ainda existem várias melhorias planejadas, como:

- banco de dados real de equipamentos;
- login de usuários;
- projetos salvos na nuvem;
- painel administrativo;
- catálogo de marcas e modelos;
- exportação de projeto;
- melhorias no dashboard;
- versão PWA;
- futura versão mobile.

---

## Visão futura

A visão do SomCerto é evoluir para uma plataforma completa de apoio à montagem de som automotivo.

No futuro, o usuário poderá buscar equipamentos em um banco de dados, adicionar ao projeto, visualizar compatibilidade, calcular caixa, configurar cortes e salvar tudo em sua conta.

A ideia é transformar o processo de montagem em algo mais claro, visual e seguro.

---

## Aviso importante

O SomCerto é uma ferramenta de apoio e aprendizado.

As sugestões geradas pelo app devem ser usadas como referência inicial. A instalação e regulagem final de um sistema de som automotivo devem considerar as especificações oficiais dos fabricantes, boas práticas de instalação e, quando possível, acompanhamento de um profissional qualificado.

Configurações incorretas podem causar danos aos equipamentos.

---

## Autor

Projeto desenvolvido por **Matheus Araujo Macedo**.

O SomCerto nasceu como um projeto pessoal de aprendizado, desenvolvimento web e aplicação prática de conceitos de tecnologia em um problema real do universo de som automotivo.
