import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Fully functional calculator that disguises the app
// Hidden gesture: press "=" button 5 times in a row to reveal dashboard
export default function Calculator() {
  const navigate = useNavigate();
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [eqCount, setEqCount] = useState(0);
  const eqTimer = useRef(null);

  const handleDigit = (digit) => {
    setEqCount(0);
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(prev => prev === '0' ? String(digit) : prev + digit);
    }
  };

  const handleDecimal = () => {
    setEqCount(0);
    if (!display.includes('.')) setDisplay(prev => prev + '.');
  };

  const handleOperator = (op) => {
    setEqCount(0);
    setExpression(display + ' ' + op + ' ');
    setWaitingForOperand(true);
  };

  const handleEquals = () => {
    // Secret gesture: 5 consecutive = presses reveals dashboard
    clearTimeout(eqTimer.current);
    const newCount = eqCount + 1;
    setEqCount(newCount);
    eqTimer.current = setTimeout(() => setEqCount(0), 3000);

    if (newCount >= 5) {
      navigate('/');
      return;
    }

    if (!expression) return;
    try {
      const parts = expression.trim().split(' ');
      const left = parseFloat(parts[0]);
      const op = parts[1];
      const right = parseFloat(display);
      let result;
      if (op === '+') result = left + right;
      else if (op === '−') result = left - right;
      else if (op === '×') result = left * right;
      else if (op === '÷') result = right !== 0 ? left / right : 'Error';
      setDisplay(result === 'Error' ? 'Error' : String(parseFloat(result.toFixed(10))));
      setExpression('');
      setWaitingForOperand(true);
    } catch {
      setDisplay('Error');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setWaitingForOperand(false);
    setEqCount(0);
  };

  const handleToggleSign = () => {
    setDisplay(prev => String(-parseFloat(prev)));
  };

  const handlePercent = () => {
    setDisplay(prev => String(parseFloat(prev) / 100));
  };

  const btn = (label, onClick, variant = 'num') => {
    const styles = {
      num: 'bg-[#333333] text-white',
      op: 'bg-[#ff9f0a] text-white',
      fn: 'bg-[#a5a5a5] text-black',
      zero: 'bg-[#333333] text-white col-span-2 justify-start pl-7',
    };
    return (
      <button
        onClick={onClick}
        className={`h-16 rounded-full flex items-center justify-center text-2xl font-light select-none active:opacity-70 transition-opacity ${styles[variant]}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-black flex items-end justify-center pb-4">
      <div className="w-full max-w-sm px-4">
        {/* Display */}
        <div className="text-right px-4 pb-4">
          {expression && <p className="text-[#888] text-lg">{expression}</p>}
          <p className={`text-white font-thin leading-none ${display.length > 9 ? 'text-5xl' : 'text-7xl'}`}>
            {display.length > 12 ? parseFloat(display).toExponential(4) : display}
          </p>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-3">
          {/* Row 1 */}
          {btn('AC', handleClear, 'fn')}
          {btn('+/−', handleToggleSign, 'fn')}
          {btn('%', handlePercent, 'fn')}
          {btn('÷', () => handleOperator('÷'), 'op')}

          {/* Row 2 */}
          {btn('7', () => handleDigit('7'))}
          {btn('8', () => handleDigit('8'))}
          {btn('9', () => handleDigit('9'))}
          {btn('×', () => handleOperator('×'), 'op')}

          {/* Row 3 */}
          {btn('4', () => handleDigit('4'))}
          {btn('5', () => handleDigit('5'))}
          {btn('6', () => handleDigit('6'))}
          {btn('−', () => handleOperator('−'), 'op')}

          {/* Row 4 */}
          {btn('1', () => handleDigit('1'))}
          {btn('2', () => handleDigit('2'))}
          {btn('3', () => handleDigit('3'))}
          {btn('+', () => handleOperator('+'), 'op')}

          {/* Row 5 */}
          <button
            onClick={() => handleDigit('0')}
            className="h-16 rounded-full bg-[#333333] text-white col-span-2 flex items-center text-2xl font-light pl-7 select-none active:opacity-70 transition-opacity"
          >
            0
          </button>
          {btn('.', handleDecimal)}
          {btn('=', handleEquals, 'op')}
        </div>

        {/* Hidden hint — only visible as tiny dot, easy to miss */}
        <div className="flex justify-center mt-4">
          <div className="w-1 h-1 rounded-full bg-white/10" title="Press = five times to reveal" />
        </div>
      </div>
    </div>
  );
}