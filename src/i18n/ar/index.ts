/** The Arabic dictionary: English text → translation. Generated from the translation files beside it; see src/i18n/README.md. */
import ui from "./ui.json";
import data from "./data.json";
import legal from "./legal.json";

const dict: Record<string, string> = { ...legal, ...data, ...ui };
export default dict;
