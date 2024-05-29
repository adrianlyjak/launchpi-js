import { RGB } from "../../functions/colors";

export interface BaseSelectProps {
  options: number;
  selected: number;
  setSelected: (selected: number) => void;
  color?: RGB;
  colors?: RGB[];
}
