import { EntityDictionary } from './prompt-search.types';

/**
 * Entity dictionary for Hebrew and English vehicle search
 * Normalized values use Hebrew (as that's what the gov.il API expects)
 */
export const ENTITY_DICTIONARY: EntityDictionary = {
  manufacturers: {
    // Toyota
    'טויוטה': ['טויוטה', 'toyota', 'טיוטה', 'טוטה'],
    // Ford
    'פורד': ['פורד', 'ford', 'פורד גרמניה'],
    // Mazda
    'מאזדה': ['מאזדה', 'mazda', 'מזדה'],
    // Honda
    'הונדה': ['הונדה', 'honda', 'הונדא'],
    // Subaru
    'סובארו': ['סובארו', 'subaru', 'סוברו'],
    // Hyundai
    'יונדאי': ['יונדאי', 'hyundai', 'הונדאי', 'יונדאי מוטור'],
    // Kia
    'קיה': ['קיה', 'kia'],
    // Nissan
    'ניסאן': ['ניסאן', 'nissan', 'ניסן'],
    // Mitsubishi
    'מיצובישי': ['מיצובישי', 'mitsubishi', 'מיצובישי מוטורס'],
    // Mercedes-Benz
    'מרצדס-בנץ': ['מרצדס', 'mercedes', 'benz', 'מרצדס בנץ', 'מרצדס-בנץ'],
    // BMW
    'ב.מ.וו': ['bmw', 'ב.מ.וו', 'במוו'],
    // Volkswagen
    'פולקסווגן': ['volkswagen', 'vw', 'פולקסווגן', 'פולקסוואגן'],
    // Audi
    'אאודי': ['audi', 'אאודי', 'אודי'],
    // Chevrolet
    'שברולט': ['chevrolet', 'שברולט', 'שברוולט', 'chevy'],
    // Peugeot
    'פיג\'ו': ['peugeot', 'פיג\'ו', 'פיז\'ו'],
    // Renault
    'רנו': ['renault', 'רנו', 'רנאו'],
    // Citroen
    'סיטרואן': ['citroen', 'סיטרואן', 'סיטרואן'],
    // Skoda
    'סקודה': ['skoda', 'סקודה', 'סקודא'],
    // Seat
    'סיאט': ['seat', 'סיאט', 'סיט'],
    // Opel
    'אופל': ['opel', 'אופל'],
    // Fiat
    'פיאט': ['fiat', 'פיאט'],
    // Volvo
    'וולוו': ['volvo', 'וולוו', 'וולבו'],
    // Tesla
    'טסלה': ['tesla', 'טסלה'],
    // Lexus
    'לקסוס': ['lexus', 'לקסוס', 'לכסוס'],
  },
  colors: {
    'לבן': ['לבן', 'white', 'לבנה'],
    'שחור': ['שחור', 'black', 'שחורה'],
    'אדום': ['אדום', 'red', 'אדומה'],
    'כחול': ['כחול', 'blue', 'כחולה'],
    'אפור': ['אפור', 'gray', 'grey', 'אפורה'],
    'כסוף': ['כסוף', 'silver', 'כסופה'],
    'ירוק': ['ירוק', 'green', 'ירוקה'],
    'צהוב': ['צהוב', 'yellow', 'צהובה'],
    'חום': ['חום', 'brown', 'חומה'],
    'סגול': ['סגול', 'purple', 'סגולה'],
    'תכלת': ['תכלת', 'cyan', 'תכולה'],
    'ורוד': ['ורוד', 'pink', 'ורודה'],
    'זהב': ['זהב', 'gold', 'זהובה'],
    'כתום': ['כתום', 'orange', 'כתומה'],
  },
  fuelTypes: {
    'בנזין': ['בנזין', 'gasoline', 'petrol', 'gas'],
    'דיזל': ['דיזל', 'diesel'],
    'חשמלי': ['חשמלי', 'electric', 'חשמל', 'חשמלית'],
    'היברידי': ['היברידי', 'hybrid', 'היברדי', 'היבריד'],
    'גפ"מ': ['גפמ', 'gpm', 'גפ"מ', 'lpg', 'גז'],
    'אתנול': ['אתנול', 'ethanol'],
  },
  ownership: {
    'פרטי': ['פרטי', 'private', 'פרטית'],
    'ציבורי': ['ציבורי', 'public', 'ציבורית'],
    'מוניות': ['מוניות', 'taxi', 'מונית', 'תחבורה ציבורית'],
    'מסחרי': ['מסחרי', 'commercial', 'מסחרית'],
    'חקלאי': ['חקלאי', 'agricultural', 'חקלאית', 'חקלאות'],
  },
  yearKeywords: [
    'שנת',
    'משנת',
    'year',
    'from',
    'מ-',
    'עד',
    'to',
    'בין',
    'between',
  ],
};
