-- ==========================================
-- SOMCERTO - SCHEMA INICIAL: CATÁLOGO
-- ==========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================
-- 1. BRANDS
-- ==========================================
CREATE TABLE brands (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    website text,
    country text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_brands_updated_at
    BEFORE UPDATE ON brands
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_brands_slug ON brands(slug);

-- ==========================================
-- 2. EQUIPMENT_MODELS
-- ==========================================
CREATE TABLE equipment_models (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id uuid REFERENCES brands(id),
    type text NOT NULL,
    name text NOT NULL,
    model text,
    slug text NOT NULL UNIQUE,
    
    -- Specs gerais
    rms_power numeric,
    max_power numeric,
    impedance numeric,
    impedance_label text,
    voice_coil_type text,
    impedance_per_coil numeric,
    final_impedance numeric,
    diameter_inches numeric,
    
    -- Amplificadores
    total_channels integer,
    min_impedance numeric,
    min_impedance_per_channel numeric,
    min_impedance_bridge numeric,
    bridge_supported boolean DEFAULT false,
    voltage numeric,
    max_current_amps numeric,
    
    -- Caixas (Enclosure)
    enclosure_type text,
    volume_liters numeric,
    tuning_hz numeric,
    
    -- Controle e Qualidade
    notes text,
    data_quality text DEFAULT 'unverified',
    active boolean DEFAULT true,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    CONSTRAINT chk_equipment_type CHECK (type IN (
        'subwoofer', 'midrange', 'driver', 'tweeter', 
        'amplifier', 'processor', 'powerSupply', 
        'battery', 'enclosure', 'accessory'
    )),
    CONSTRAINT chk_voice_coil_type CHECK (voice_coil_type IN ('single', 'dual') OR voice_coil_type IS NULL),
    CONSTRAINT chk_data_quality CHECK (data_quality IN ('unverified', 'verified', 'official'))
);

CREATE TRIGGER update_equipment_models_updated_at
    BEFORE UPDATE ON equipment_models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_equipment_models_slug ON equipment_models(slug);
CREATE INDEX idx_equipment_models_type ON equipment_models(type);
CREATE INDEX idx_equipment_models_brand_id ON equipment_models(brand_id);
CREATE INDEX idx_equipment_models_name ON equipment_models USING gin(name gin_trgm_ops); -- Útil para busca textual no futuro, se pg_trgm estiver ativo
CREATE INDEX idx_equipment_models_active ON equipment_models(active);

-- ==========================================
-- 3. AMPLIFIER_POWER_RATINGS
-- ==========================================
CREATE TABLE amplifier_power_ratings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_model_id uuid NOT NULL REFERENCES equipment_models(id) ON DELETE CASCADE,
    mode text NOT NULL, -- per_channel, bridge, mono
    impedance numeric NOT NULL,
    watts_rms numeric NOT NULL,
    channels integer,
    notes text,
    created_at timestamptz DEFAULT now()
);

-- ==========================================
-- 4. SPEAKER_PARAMETERS
-- ==========================================
CREATE TABLE speaker_parameters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_model_id uuid NOT NULL REFERENCES equipment_models(id) ON DELETE CASCADE,
    frequency_response_min numeric,
    frequency_response_max numeric,
    sensitivity_db numeric,
    fs numeric,
    qts numeric,
    vas_liters numeric,
    xmax_mm numeric,
    recommended_sealed_volume_liters numeric,
    recommended_ported_volume_liters numeric,
    recommended_tuning_hz numeric,
    notes text,
    created_at timestamptz DEFAULT now()
);

-- ==========================================
-- SUGESTÃO FUTURA DE RLS (Comentada)
-- ==========================================
-- ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE equipment_models ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Catálogo é público para leitura" 
-- ON brands FOR SELECT USING (true);
-- 
-- CREATE POLICY "Catálogo é público para leitura" 
-- ON equipment_models FOR SELECT USING (active = true);


-- ==========================================
-- INSERTS INICIAIS
-- ==========================================

-- Marcas
INSERT INTO brands (name, slug, country) VALUES
('Bomber', 'bomber', 'Brasil'),
('Taramps', 'taramps', 'Brasil'),
('Soundigital', 'soundigital', 'Brasil'),
('JBL Selenium', 'jbl-selenium', 'Brasil/EUA'),
('Pioneer', 'pioneer', 'Japão'),
('Stetsom', 'stetsom', 'Brasil');

-- Buscar os IDs inseridos para referenciar nos produtos
DO $$
DECLARE
    v_bomber_id uuid;
    v_taramps_id uuid;
    v_soundigital_id uuid;
    v_jbl_id uuid;
BEGIN
    SELECT id INTO v_bomber_id FROM brands WHERE slug = 'bomber';
    SELECT id INTO v_taramps_id FROM brands WHERE slug = 'taramps';
    SELECT id INTO v_soundigital_id FROM brands WHERE slug = 'soundigital';
    SELECT id INTO v_jbl_id FROM brands WHERE slug = 'jbl-selenium';

    -- Bomber Bicho Papão 12 800W 4+4
    INSERT INTO equipment_models (
        brand_id, type, name, slug, rms_power, diameter_inches, voice_coil_type, impedance_per_coil, notes, data_quality
    ) VALUES (
        v_bomber_id, 'subwoofer', 'Bicho Papão 12 800W', 'bomber-bicho-papao-12-800w-4-4', 800, 12, 'dual', 4, 'Verificar especificações oficiais antes da instalação.', 'unverified'
    );

    -- Bomber Bicho Papão 12 600W 4 ohms
    INSERT INTO equipment_models (
        brand_id, type, name, slug, rms_power, diameter_inches, voice_coil_type, final_impedance, notes, data_quality
    ) VALUES (
        v_bomber_id, 'subwoofer', 'Bicho Papão 12 600W', 'bomber-bicho-papao-12-600w-4-ohms', 600, 12, 'single', 4, 'Verificar especificações oficiais antes da instalação.', 'unverified'
    );

    -- Bomber Copper Ring 8 500W 8 ohms
    INSERT INTO equipment_models (
        brand_id, type, name, slug, rms_power, diameter_inches, voice_coil_type, final_impedance, notes, data_quality
    ) VALUES (
        v_bomber_id, 'midrange', 'Copper Ring 8 500W', 'bomber-copper-ring-8-500w-8-ohms', 500, 8, 'single', 8, 'Verificar especificações oficiais antes da instalação.', 'unverified'
    );

    -- JBL Selenium D200X 110W 8 ohms
    INSERT INTO equipment_models (
        brand_id, type, name, slug, rms_power, final_impedance, notes, data_quality
    ) VALUES (
        v_jbl_id, 'driver', 'D200X 110W', 'jbl-selenium-d200x-110w-8-ohms', 110, 8, 'Verificar especificações oficiais antes da instalação.', 'unverified'
    );

    -- JBL Selenium D250X
    INSERT INTO equipment_models (
        brand_id, type, name, slug, rms_power, final_impedance, notes, data_quality
    ) VALUES (
        v_jbl_id, 'driver', 'D250X 100W', 'jbl-selenium-d250x-100w-8-ohms', 100, 8, 'Verificar especificações oficiais antes da instalação.', 'unverified'
    );

    -- Soundigital SD 800.4 EVO 6
    INSERT INTO equipment_models (
        brand_id, type, name, slug, rms_power, total_channels, min_impedance_per_channel, min_impedance_bridge, bridge_supported, notes, data_quality
    ) VALUES (
        v_soundigital_id, 'amplifier', 'SD 800.4 EVO 6', 'soundigital-sd-800-4-evo-6', 800, 4, 2, 4, true, 'Verificar especificações oficiais antes da instalação.', 'unverified'
    );

    -- Soundigital SD 1200.1 EVO 6 4 ohms
    INSERT INTO equipment_models (
        brand_id, type, name, slug, rms_power, total_channels, min_impedance, notes, data_quality
    ) VALUES (
        v_soundigital_id, 'amplifier', 'SD 1200.1 EVO 6', 'soundigital-sd-1200-1-evo-6-4-ohms', 1200, 1, 4, 'Verificar especificações oficiais antes da instalação.', 'unverified'
    );

    -- Taramps MD 1200.1 4 ohms
    INSERT INTO equipment_models (
        brand_id, type, name, slug, rms_power, total_channels, min_impedance, notes, data_quality
    ) VALUES (
        v_taramps_id, 'amplifier', 'MD 1200.1', 'taramps-md-1200-1-4-ohms', 1200, 1, 4, 'Verificar especificações oficiais antes da instalação.', 'unverified'
    );

    -- Taramps TS 800x4
    INSERT INTO equipment_models (
        brand_id, type, name, slug, rms_power, total_channels, min_impedance_per_channel, min_impedance_bridge, bridge_supported, notes, data_quality
    ) VALUES (
        v_taramps_id, 'amplifier', 'TS 800x4', 'taramps-ts-800x4', 800, 4, 2, 4, true, 'Verificar especificações oficiais antes da instalação.', 'unverified'
    );

    -- Taramps Pro 2.4 BT
    INSERT INTO equipment_models (
        brand_id, type, name, slug, notes, data_quality
    ) VALUES (
        v_taramps_id, 'processor', 'Pro 2.4 BT', 'taramps-pro-2-4-bt', 'Verificar especificações oficiais antes da instalação.', 'unverified'
    );

    -- Fonte Taramps 120A
    INSERT INTO equipment_models (
        brand_id, type, name, slug, max_current_amps, notes, data_quality
    ) VALUES (
        v_taramps_id, 'powerSupply', 'Fonte 120A', 'taramps-fonte-120a', 120, 'Verificar especificações oficiais antes da instalação.', 'unverified'
    );
END $$;
