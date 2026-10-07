import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ChairOutlinedIcon from '@mui/icons-material/ChairOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ChildCareOutlinedIcon from '@mui/icons-material/ChildCareOutlined';
import SportsBasketballOutlinedIcon from '@mui/icons-material/SportsBasketballOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';

// A recognisable icon per known category name; anything else (incl. new categories) gets the generic one
const CATEGORY_ICONS = [
  [/בית|רהיט/, ChairOutlinedIcon],
  [/אלקטרוניקה|electronic/i, DevicesOutlinedIcon],
  [/אופנה|בגד/, CheckroomOutlinedIcon],
  [/ספר/, MenuBookOutlinedIcon],
  [/ילד|תינוק/, ChildCareOutlinedIcon],
  [/ספורט/, SportsBasketballOutlinedIcon],
  [/משחק/, SportsEsportsOutlinedIcon],
  [/כלי עבודה|עבודה/, HandymanOutlinedIcon],
  [/שונות/, AutoAwesomeOutlinedIcon],
];

export const iconForCategory = (name = '') =>
  (CATEGORY_ICONS.find(([pattern]) => pattern.test(name)) || [null, CategoryOutlinedIcon])[1];

// Number of soft tints (see the *-tint-N classes) category visuals cycle through
export const TINT_COUNT = 6;
