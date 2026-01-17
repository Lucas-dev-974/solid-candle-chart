import { createSignal } from 'solid-js';
import type { ChartTheme } from '../core/types';
import { SettingsIcon } from './SettingsIcon';
import { ThemeModal } from './ThemeModal';

export interface SettingsButtonProps {
  theme: ChartTheme;
  onThemeChange: (theme: ChartTheme) => void;
}

export function SettingsButton(props: SettingsButtonProps) {
  const [isModalOpen, setIsModalOpen] = createSignal(false);

  return (
    <>
      <div
        class="flex items-center justify-center relative"
        style={{ background: props.theme.background }}
      >
        <button
          onClick={() => setIsModalOpen(true)}
          class="bg-transparent border-none cursor-pointer p-1 flex items-center justify-center transition-opacity duration-200 hover:opacity-80"
          style={{ color: props.theme.axisText }}
          title="Paramètres du thème"
        >
          <SettingsIcon />
        </button>
      </div>
      <ThemeModal
        isOpen={isModalOpen()}
        theme={props.theme}
        onClose={() => setIsModalOpen(false)}
        onThemeChange={props.onThemeChange}
      />
    </>
  );
}
