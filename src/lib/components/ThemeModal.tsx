import { createSignal, Show } from 'solid-js';
import type { ChartTheme } from '../core/types';

interface ThemeModalProps {
  isOpen: boolean;
  theme: ChartTheme;
  onClose: () => void;
  onThemeChange: (theme: ChartTheme) => void;
}

export function ThemeModal(props: ThemeModalProps) {
  const [localTheme, setLocalTheme] = createSignal<ChartTheme>(props.theme);

  const handleColorChange = (key: keyof ChartTheme, value: string) => {
    setLocalTheme((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    props.onThemeChange(localTheme());
    props.onClose();
  };

  const handleReset = () => {
    setLocalTheme(props.theme);
  };

  return (
    <Show when={props.isOpen}>
      <div
        class="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
        onClick={props.onClose}
      >
        <div
          class="bg-[#2a2a3e] p-6 rounded-lg min-w-[400px] max-w-[500px] max-h-[80vh] overflow-auto text-white shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div class="flex justify-between items-center mb-5">
            <h2 class="m-0 text-white">Configuration du thème</h2>
            <button
              onClick={props.onClose}
              class="bg-transparent border-none text-[#a0a0a0] cursor-pointer text-2xl p-0 w-[30px] h-[30px] flex items-center justify-center"
            >
              ×
            </button>
          </div>

          <div class="flex flex-col gap-4">
            <ColorInput
              label="Fond"
              value={localTheme().background}
              onChange={(value) => handleColorChange('background', value)}
            />
            <ColorInput
              label="Bougie haussière"
              value={localTheme().bullCandle}
              onChange={(value) => handleColorChange('bullCandle', value)}
            />
            <ColorInput
              label="Mèche haussière"
              value={localTheme().bullWick}
              onChange={(value) => handleColorChange('bullWick', value)}
            />
            <ColorInput
              label="Bougie baissière"
              value={localTheme().bearCandle}
              onChange={(value) => handleColorChange('bearCandle', value)}
            />
            <ColorInput
              label="Mèche baissière"
              value={localTheme().bearWick}
              onChange={(value) => handleColorChange('bearWick', value)}
            />
            <ColorInput
              label="Ligne d'axe"
              value={localTheme().axisLine}
              onChange={(value) => handleColorChange('axisLine', value)}
            />
            <ColorInput
              label="Texte d'axe"
              value={localTheme().axisText}
              onChange={(value) => handleColorChange('axisText', value)}
            />
            <ColorInput
              label="Ligne de grille"
              value={localTheme().gridLine}
              onChange={(value) => handleColorChange('gridLine', value)}
            />
            <ColorInput
              label="Réticule"
              value={localTheme().crosshair}
              onChange={(value) => handleColorChange('crosshair', value)}
            />
          </div>

          <div class="flex gap-3 mt-6 justify-end">
            <button
              onClick={handleReset}
              class="px-4 py-2 bg-[#404040] text-white border-none rounded cursor-pointer"
            >
              Réinitialiser
            </button>
            <button
              onClick={handleApply}
              class="px-4 py-2 bg-[#26a69a] text-white border-none rounded cursor-pointer"
            >
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorInput(props: ColorInputProps) {
  return (
    <div class="flex items-center gap-3">
      <label class="min-w-[140px] text-[#a0a0a0]">{props.label}:</label>
      <input
        type="color"
        value={props.value}
        onInput={(e) => props.onChange(e.currentTarget.value)}
        class="w-[50px] h-[30px] border border-[#404040] rounded cursor-pointer bg-transparent"
      />
      <input
        type="text"
        value={props.value}
        onInput={(e) => props.onChange(e.currentTarget.value)}
        class="flex-1 py-1.5 px-2 bg-[#1a1a2e] text-white border border-[#404040] rounded font-mono text-xs"
      />
    </div>
  );
}
