-- =============================================================================
-- Seed de conteúdo inicial — catálogo estático de temas + leitura recomendada
--
-- Roda como service role (SQL Editor / postgres), então ignora RLS. Seguro
-- rodar mais de uma vez: temas usam ON CONFLICT (slug); leituras checam
-- existência antes de inserir.
-- =============================================================================

insert into public.temas (slug, titulo, descricao, categoria, nivel_leitura, destaque_inicial)
values
  (
    'existencia-de-deus',
    'A existência de Deus',
    'Os principais argumentos filosóficos a favor e contra a existência de um ser divino — cosmológico, ontológico, teleológico — e as críticas mais influentes a cada um.',
    'filosofia da religião',
    'introdutorio',
    true
  ),
  (
    'fe-e-razao',
    'Fé e razão',
    'A relação entre crença religiosa e investigação racional: são compatíveis, complementares ou inevitavelmente em tensão?',
    'filosofia da religião',
    'introdutorio',
    true
  ),
  (
    'problema-do-mal',
    'O problema do mal (teodiceia)',
    'Como conciliar a existência de um Deus onipotente e bom com a realidade do sofrimento e do mal no mundo.',
    'teodiceia',
    'intermediario',
    true
  ),
  (
    'escatologia-crista',
    'Escatologia cristã: o fim dos tempos',
    'As diferentes leituras teológicas sobre juízo final, ressurreição e o destino último da criação.',
    'escatologia',
    'intermediario',
    false
  ),
  (
    'livre-arbitrio',
    'Livre-arbítrio e predestinação',
    'O debate entre liberdade humana e soberania divina, e como diferentes tradições tentam resolvê-lo.',
    'teologia sistemática',
    'avancado',
    false
  ),
  (
    'natureza-da-trindade',
    'A natureza da Trindade',
    'A formulação doutrinária da Trindade, suas controvérsias históricas e as principais objeções filosóficas.',
    'teologia sistemática',
    'avancado',
    false
  )
on conflict (slug) do nothing;

insert into public.leituras_recomendadas (titulo, autor, link_ou_referencia, tema_id, ordem_exibicao)
select v.titulo, v.autor, v.link_ou_referencia, t.id, v.ordem_exibicao
from (
  values
    ('Suma Teológica (seleção sobre as vias)', 'Tomás de Aquino', 'Suma Teológica, Parte I, Questão 2', 'existencia-de-deus', 1),
    ('Proslógio', 'Anselmo de Cantuária', 'Proslógio, capítulos II-IV', 'existencia-de-deus', 2),
    ('Cur Deus Homo', 'Anselmo de Cantuária', 'Cur Deus Homo (Por que Deus se fez homem)', 'fe-e-razao', 1),
    ('Fides et Ratio', 'João Paulo II', 'Carta encíclica Fides et Ratio (1998)', 'fe-e-razao', 2),
    ('O Problema do Sofrimento', 'C.S. Lewis', 'The Problem of Pain (1940)', 'problema-do-mal', 1),
    ('Teodiceia', 'Gottfried Wilhelm Leibniz', 'Essais de Théodicée (1710)', 'problema-do-mal', 2),
    ('Apocalipse: um comentário', 'N.T. Wright', 'Revelation for Everyone (2011)', 'escatologia-crista', 1),
    ('A Cidade de Deus (livros XIX-XXII)', 'Agostinho de Hipona', 'De Civitate Dei, livros XIX-XXII', 'escatologia-crista', 2),
    ('Sobre o Livre-Arbítrio', 'Agostinho de Hipona', 'De Libero Arbitrio', 'livre-arbitrio', 1),
    ('A Escravidão da Vontade', 'Martinho Lutero', 'De Servo Arbitrio (1525)', 'livre-arbitrio', 2),
    ('Sobre a Santíssima Trindade', 'Agostinho de Hipona', 'De Trinitate', 'natureza-da-trindade', 1)
) as v(titulo, autor, link_ou_referencia, tema_slug, ordem_exibicao)
join public.temas t on t.slug = v.tema_slug
where not exists (
  select 1 from public.leituras_recomendadas lr where lr.titulo = v.titulo
);
