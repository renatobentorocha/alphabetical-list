import { PixelRatio } from 'react-native';

type sizeProps = {
  origin_size: number;
  destination_size: number;
  size: number;
};

export const scale = ({ origin_size, destination_size, size }: sizeProps) => {
  return PixelRatio.roundToNearestPixel(
    (size / origin_size) * destination_size
  );
};

export const WIDTH_ORIGIN = 375;
export const HEIGHT_ORIGIN = 667;
