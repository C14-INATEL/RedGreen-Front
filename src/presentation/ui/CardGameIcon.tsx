import { useEffect, useState } from 'react';

import cardIcon1 from '../../assets/CardsIcon/CardIcon1.png';
import cardIcon2 from '../../assets/CardsIcon/CardIcon2.png';
import cardIcon3 from '../../assets/CardsIcon/CardIcon3.png';
import cardIcon4 from '../../assets/CardsIcon/CardIcon4.png';
import cardIcon5 from '../../assets/CardsIcon/CardIcon5.png';
import cardIcon6 from '../../assets/CardsIcon/CardIcon6.png';
import cardIcon7 from '../../assets/CardsIcon/CardIcon7.png';

const Frames = [
  cardIcon1,
  cardIcon2,
  cardIcon3,
  cardIcon4,
  cardIcon5,
  cardIcon6,
  cardIcon7,
];

const CardGameIcon = () => {
  const [FrameIndex, SetFrameIndex] = useState(0);

  useEffect(() => {
    let Direction = 1;

    const IntervalId = window.setInterval(() => {
      SetFrameIndex((CurrentFrameIndex) => {
        const NextFrameIndex = CurrentFrameIndex + Direction;

        if (NextFrameIndex >= Frames.length) {
          Direction = -1;
          return Frames.length - 2;
        }

        if (NextFrameIndex < 0) {
          Direction = 1;
          return 1;
        }

        return NextFrameIndex;
      });
    }, 240);

    return () => window.clearInterval(IntervalId);
  }, []);

  return (
    <img
      src={Frames[FrameIndex]}
      alt="Jogo de cartas"
      className="h-20 w-20 object-contain"
    />
  );
};

export default CardGameIcon;
