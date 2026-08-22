// Tipos do schema Postgres, escritos à mão a partir de
// supabase/migrations/20260821000000_init_schema.sql.
//
// Se preferir gerar automaticamente depois (requer `supabase login`):
//   npx supabase gen types typescript --project-id yvdmzzrmelnuayamvbcr > src/types/database.types.ts

export type NivelLeitura = 'introdutorio' | 'intermediario' | 'avancado'
export type DiscussaoTipo = 'tema' | 'geral'
export type TipoRegistro = 'devocional' | 'academico' | 'filosofico'
export type TipoInteracao = 'visualizou' | 'favoritou' | 'comentou'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nome: string
          email: string
          tradicao_declarada: string | null
          bio: string | null
          foto_url: string | null
          is_admin: boolean
          criado_em: string
        }
        Insert: {
          id: string
          nome: string
          email: string
          tradicao_declarada?: string | null
          bio?: string | null
          foto_url?: string | null
          is_admin?: boolean
          criado_em?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          tradicao_declarada?: string | null
          bio?: string | null
          foto_url?: string | null
          is_admin?: boolean
          criado_em?: string
        }
        Relationships: []
      }
      temas: {
        Row: {
          id: string
          slug: string
          titulo: string
          descricao: string | null
          categoria: string
          nivel_leitura: NivelLeitura
          destaque_inicial: boolean
          criado_em: string
        }
        Insert: {
          id?: string
          slug: string
          titulo: string
          descricao?: string | null
          categoria: string
          nivel_leitura?: NivelLeitura
          destaque_inicial?: boolean
          criado_em?: string
        }
        Update: {
          id?: string
          slug?: string
          titulo?: string
          descricao?: string | null
          categoria?: string
          nivel_leitura?: NivelLeitura
          destaque_inicial?: boolean
          criado_em?: string
        }
        Relationships: []
      }
      discussoes: {
        Row: {
          id: string
          tema_id: string | null
          tipo: DiscussaoTipo
          titulo: string
          autor_id: string
          criado_em: string
        }
        Insert: {
          id?: string
          tema_id?: string | null
          tipo: DiscussaoTipo
          titulo: string
          autor_id: string
          criado_em?: string
        }
        Update: {
          id?: string
          tema_id?: string | null
          tipo?: DiscussaoTipo
          titulo?: string
          autor_id?: string
          criado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: 'discussoes_tema_id_fkey'
            columns: ['tema_id']
            referencedRelation: 'temas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'discussoes_autor_id_fkey'
            columns: ['autor_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      comentarios: {
        Row: {
          id: string
          discussao_id: string
          autor_id: string
          texto: string
          fonte_citada: string | null
          tipo_registro: TipoRegistro | null
          resposta_a: string | null
          criado_em: string
        }
        Insert: {
          id?: string
          discussao_id: string
          autor_id: string
          texto: string
          fonte_citada?: string | null
          tipo_registro?: TipoRegistro | null
          resposta_a?: string | null
          criado_em?: string
        }
        Update: {
          id?: string
          discussao_id?: string
          autor_id?: string
          texto?: string
          fonte_citada?: string | null
          tipo_registro?: TipoRegistro | null
          resposta_a?: string | null
          criado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: 'comentarios_discussao_id_fkey'
            columns: ['discussao_id']
            referencedRelation: 'discussoes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comentarios_autor_id_fkey'
            columns: ['autor_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comentarios_resposta_a_fkey'
            columns: ['resposta_a']
            referencedRelation: 'comentarios'
            referencedColumns: ['id']
          },
        ]
      }
      leituras_recomendadas: {
        Row: {
          id: string
          titulo: string
          autor: string
          link_ou_referencia: string
          tema_id: string | null
          ordem_exibicao: number
        }
        Insert: {
          id?: string
          titulo: string
          autor: string
          link_ou_referencia: string
          tema_id?: string | null
          ordem_exibicao?: number
        }
        Update: {
          id?: string
          titulo?: string
          autor?: string
          link_ou_referencia?: string
          tema_id?: string | null
          ordem_exibicao?: number
        }
        Relationships: [
          {
            foreignKeyName: 'leituras_recomendadas_tema_id_fkey'
            columns: ['tema_id']
            referencedRelation: 'temas'
            referencedColumns: ['id']
          },
        ]
      }
      interacoes_usuario: {
        Row: {
          id: string
          usuario_id: string
          tema_id: string
          tipo_interacao: TipoInteracao
          criado_em: string
        }
        Insert: {
          id?: string
          usuario_id: string
          tema_id: string
          tipo_interacao: TipoInteracao
          criado_em?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          tema_id?: string
          tipo_interacao?: TipoInteracao
          criado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: 'interacoes_usuario_usuario_id_fkey'
            columns: ['usuario_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'interacoes_usuario_tema_id_fkey'
            columns: ['tema_id']
            referencedRelation: 'temas'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
