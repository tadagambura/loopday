import { CardLibrary, type CardPack } from '@/kit/cards';
import { H1, Muted, Screen } from '@/kit/ui';
import raw from '@/content/cards.json';

const pack = raw as CardPack;

export default function Learn() {
  return (
    <Screen testID="learn">
      <H1>Habits that stick</H1>
      <Muted>Ideas from Atomic Habits (in our own words) and habit research.</Muted>
      <CardLibrary pack={pack} app="loopday" />
    </Screen>
  );
}
