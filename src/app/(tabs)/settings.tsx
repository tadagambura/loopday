import { KitSettings } from '@/kit/Settings';

export default function Settings() {
  return (
    <KitSettings
      reminder={{
        title: 'LoopDay',
        body: 'A tiny loop for today? One tap is all it takes.',
        explain: 'One reminder a day at a time you choose. Never more.',
      }}
    />
  );
}
