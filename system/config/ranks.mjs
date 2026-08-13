import { ACTOR } from "./actors.mjs";

export const RANKS = {
  [ACTOR.NATIONALITY.USA]: {
    sergeant: 4,
    default: {
      false: [
        'Private (E-1)',
        'Private First Class (E-2)',
        'Lance Corporal (E-3)',
        'Corporal (E-4)',
        'Sergeant (E-5)',
        'Staff Sergeant (E-6)',
        'Gunnery Sergeant (E-7)',
        'Master Sergeant (E-8)',
        'First Sergeant (E-8)',
        'Sergeant Major (E-9)',
      ],
      true: [
        '2nd Lieutenant (O-1)',
        '1st Lieutenant (O-2)',
        'Captain (O-3)',
        'Major (O-4)',
        'Lieutenant Colonel (O-5)',
        'Colonel (O-6)',
      ]
    },
    navy: {
      false: [
        'Seaman Recruit (E-1)',
        'Seaman Apprentice (E-2)',
        'Seaman (E-3)',
        'Petty Officer 3rd Class (E-4)',
        'Petty Officer 2nd Class (E-5)',
        'Petty Officer 1st Class (E-6)',
        'Chief Petty Officer (E-7)',
        'Senior Chief Petty Officer (E-8)',
        'Master Chief Petty Officer (E-9)',
      ],
      true: [
        'Ensign (O-1)',
        'Lieutenant Junior Grade (O-2)',
        'Lieutenant (O-3)',
        'Lieutenant Commander (O-4)',
        'Commander (O-5)',
        'Captain (O-6)',
      ],
    }
  },
  [ACTOR.NATIONALITY["United Kingdom"]]: {
    sergeant: 3,
    default: {
      false: [
        'Private',
        'Lance Corporal',
        'Corporal',
        'Sergeant',
        'Colour Sergeant',
        'Staff Sergeant',
        'Warrant Officer Class 2',
        'Warrant Officer Class 1',
      ],
      true: [
        '2nd Lieutenant',
        'Lieutenant',
        'Captain',
        'Major',
        'Lieutenant Colonel',
        'Colonel',
      ]
    },
    navy: {
      false: ['Seaman Recruit (E-1)',
        'Able Rate',
        'Leading Rate',
        'Petty Officer',
        'Chief Petty Officer',
        'Warrant Officer 2',
        'Warrant Officer 1',
      ],
      true: [
        'Sub-Lieutenant',
        'Lieutenant',
        'Lieutenant Commander',
        'Commander',
        'Captain',
      ],
    }
  },
  [ACTOR.NATIONALITY["France"]]: {
    sergeant: 3,
    default: {
      false: [
        'Soldat',
        'Caporal',
        'Caporal-Chef',
        'Sergent',
        'Sergent-Chef',
        'Adjudant',
        'Adjudant-Chef',
        'Major',
      ],
      true: [
        'Sous-Lieutenant',
        'Lieutenant',
        'Capitaine',
        'Commandant',
        'Lieutenant-Colonel',
        'Colonel',
      ],
    },
    navy: {
      false: [
        'Matelot',
        'Quartier-Maître',
        'Second-Maître',
        'Maître',
        'Premier Maître',
        'Maître Principal',
        'Major',
      ],
      true: [
        'Enseigne de vaisseau 2e classe',
        'Enseigne de vaisseau 1re classe',
        'Lieutenant de vaisseau',
        'Capitaine de corvette',
        'Capitaine de frégate',
        'Capitaine de vaisseau',
      ],
    }
  },
  [ACTOR.NATIONALITY["Canada"]]: {
    sergeant: 3,
    default: {
      false: [
        'Private',
        'Corporal',
        'Master Corporal',
        'Sergeant',
        'Warrant Officer',
        'Master Warrant Officer',
        'Chief Warrant Officer',
      ],
      true: [
        'Second Lieutenant',
        'Lieutenant',
        'Captain',
        'Major',
        'Lieutenant-Colonel',
        'Colonel',
      ],
    },
    navy: {
      false: [
        'Ordinary Seaman',
        'Able Seaman',
        'Leading Seaman',
        'Master Seaman',
        'Petty Officer 2nd Class',
        'Petty Officer 1st Class',
        'Chief Petty Officer 2nd Class',
        'Chief Petty Officer 1st Class',
      ],
      true: [
        'Acting Sub-Lieutenant',
        'Sub-Lieutenant',
        'Lieutenant',
        'Lieutenant Commander',
        'Commander',
        'Captain',
      ],
    }
  },
  [ACTOR.NATIONALITY["Norway"]]: {
    sergeant: 2,
    default: {
      false: [
        'Menig',
        'Korporal',
        'Sersjant',
        'Førstsersjant',
        'Stabssersjant',
        'Fenrik',
      ],
      true: [
        'Fenrik',
        'Løytnant',
        'Kaptein',
        'Major',
        'Oberstløytnant',
        'Oberst',
      ],
    }
  },
  [ACTOR.NATIONALITY["Dutch"]]: {
    sergeant: 3,
    default: {
      false: [
        'Soldaat',
        'Korporaal',
        'Korporaal der eerste klasse',
        'Sergeant',
        'Sergeant-majoor',
        'Adjudant-onderofficier',
      ],
      true: [
        'Tweede luitenant',
        'Eerste luitenant',
        'Kapitein',
        'Majoor',
        'Luitenant-kolonel',
        'Kolonel',
      ],
    }
  },
  [ACTOR.NATIONALITY["Australian"]]: {
    sergeant: 4,
    default: {
      false: [
        'Private',
        'Private Proficient',
        'Lance Corporal',
        'Corporal',
        'Sergeant',
        'Staff Sergeant',
        'Warrant Officer Class 2',
        'Warrant Officer Class 1',
      ],
      true: [
        'Second Lieutenant',
        'Lieutenant',
        'Captain',
        'Major',
        'Lieutenant Colonel',
        'Colonel',
      ],
    }
  },
  [ACTOR.NATIONALITY["German"]]: {
    sergeant: 5,
    default: {
      false: [
        'Schütze',
        'Gefreiter',
        'Obergefreiter',
        'Hauptgefreiter',
        'Stabsgefreiter',
        'Unteroffizier',
        'Stabsunteroffizier',
        'Feldwebel',
        'Oberfeldwebel',
        'Hauptfeldwebel',
        'Stabsfeldwebel',
      ],
      true: [
        'Leutnant',
        'Oberleutnant',
        'Hauptmann',
        'Major',
        'Oberstleutnant',
        'Oberst',
      ],
    }
  },
  [ACTOR.NATIONALITY["Spain"]]: {
    sergeant: 4,
    default: {
      false: [
        'Soldado',
        'Cabo',
        'Cabo Primero',
        'Cabo Mayor',
        'Sargento',
        'Sargento Primero',
        'Brigada',
        'Suboficial Mayor',
      ],
      true: [
        'Alférez',
        'Teniente',
        'Capitán',
        'Comandante',
        'Teniente Coronel',
        'Coronel',
      ],
    },
    navy: {
      false: [],
      true: []
    }
  },
  [ACTOR.NATIONALITY["The Philippines"]]: {
    sergeant: 3,
    default: {
      false: [
        'Private',
        'Private First Class',
        'Corporal',
        'Sergeant',
        'Staff Sergeant',
        'Technical Sergeant',
        'Master Sergeant',
        'First Sergeant',
        'Sergeant Major',
      ],
      true: [
        'Second Lieutenant',
        'First Lieutenant',
        'Captain',
        'Major',
        'Lieutenant Colonel',
        'Colonel',
      ],
    }
  },
  [ACTOR.NATIONALITY["Polish"]]: {
    sergeant: 5,
    default: {
      false: [
        'Szeregowy',
        'Starszy Szeregowy',
        'Kapral',
        'Starszy Kapral',
        'Plutonowy',
        'Sierżant',
        'Starszy Sierżant',
        'Młodszy Chorąży',
        'Chorąży',
        'Starszy Chorąży',
      ],
      true: [
        'Podporucznik',
        'Porucznik',
        'Kapitan',
        'Major',
        'Podpułkownik',
        'Pułkownik',
      ],
    }
  },
  [ACTOR.NATIONALITY["Sweden"]]: {
    sergeant: 3,
    default: {
      false: [
        'Menig',
        'Korpral',
        'Furir',
        'Sergeant',
        'Förste Sergeant',
        'Kompanisergeant',
        'Regementsergeant',
        'Förvaltare',
        'Fanjunkare',
      ],
      true: [
        'Fänrik',
        'Löjtnant',
        'Kapten',
        'Major',
        'Överstelöjtnant',
        'Överste',
      ],
    },
    navy: {
      false: [
        'Sjöman',
        'Roddare',
        'Marinkonstapel',
        'Båtsman',
        'Förste Båtsman',
        'Överbåtsman',
        'Marinförman',
      ],
      true: [
        'Fänrik',
        'Löjtnant',
        'Kapten',
        'Kommendörkapten',
        'Kommendör',
        'Överste',
      ],
    }
  },
  [ACTOR.NATIONALITY["Brazil"]]: {
    sergeant: 2,
    default: {
      false: [
        'Soldado',
        'Cabo',
        'Terceiro-Sargento',
        'Segundo-Sargento',
        'Primeiro-Sargento',
        'Subtenente',
      ],
      true: [
        'Aspirante-a-Oficial',
        'Segundo-Tenente',
        'Primeiro-Tenente',
        'Capitão',
        'Major',
        'Tenente-Coronel',
        'Coronel',
      ],
    },
    navy: {
      false: [
        'Marinheiro-Recruta',
        'Grumete',
        'Marinheiro',
        'Cabo',
        'Terceiro-Sargento',
        'Segundo-Sargento',
        'Primeiro-Sargento',
        'Suboficial',
      ],
      true: [
        'Guarda-Marinha',
        'Segundo-Tenente',
        'Primeiro-Tenente',
        'Capitão-Tenente',
        'Capitão de Corveta',
        'Capitão de Fragata',
        'Capitão de Mar e Guerra',
      ],
    }
  },
  [ACTOR.NATIONALITY["New Zealand"]]: {
    sergeant: 3,
    default: {
      false: [
        'Private',
        'Lance Corporal',
        'Corporal',
        'Sergeant',
        'Staff Sergeant',
        'Warrant Officer Class 2',
        'Warrant Officer Class 1',
      ],
      true: [
        'Marinero',
        'Cabo',
        'Sargento Segundo',
        'Sargento Primero',
        'Suboficial',
      ],
    },
    navy: {
      false: [
        'Ordinary Rating',
        'Able Rating',
        'Leading Hand',
        'Petty Officer',
        'Chief Petty Officer',
        'Warrant Officer',
      ],
      true: [
        'Ensign',
        'Sub-Lieutenant',
        'Lieutenant',
        'Lieutenant Commander',
        'Commander',
        'Captain',
      ],
    }
  },
  [ACTOR.NATIONALITY["Panama"]]: {
    sergeant: 3,
    default: {
      false: [
        'Agente',
        'Agente Distinguido',
        'Cabo',
        'Sargento Segundo',
        'Sargento Primero',
        'Suboficial',
        'Suboficial Mayor',
      ],
      true: [
        'Subteniente',
        'Teniente',
        'Capitán',
        'Mayor',
        'Teniente Coronel',
        'Coronel',
        'Comisionado',
      ],
    },
    navy: {
      false: [
        'Marinero',
        'Cabo',
        'Sargento Segundo',
        'Sargento Primero',
        'Suboficial',
      ],
      true: [
        'Subteniente',
        'Teniente',
        'Capitán',
        'Mayor',
        'Teniente Coronel',
        'Coronel',
      ],
    }
  },
  defaut: {
    sergeant: 2,
    default: {
      false: [
        'Private (E-1)',
        'Corporal (E-4)',
        'Sergeant (E-5)'
      ],
      true: [
        '2nd Lieutenant (O-1)',
        'Captain (O-3)',
        'Major (O-4)'
      ],
    },
    navy: {
      false: [
        'Seaman Recruit (E-1)',
        'Petty Officer 3rd Class (E-4)',
        'Petty Officer 2nd Class (E-5)',
      ],
      true: [
        'Ensign (O-1)',
        'Lieutenant (O-3)',
        'Lieutenant Commander (O-4)',
      ],
    }
  },
};