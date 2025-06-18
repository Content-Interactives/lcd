import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Calculator, Lightbulb, BookOpen, RefreshCw, Check, SkipForward, ArrowRight } from 'lucide-react';

const LCD = () => {
  const [inputNum1, setInputNum1] = useState('');
  const [inputNum2, setInputNum2] = useState('');
  const [displayNum1, setDisplayNum1] = useState('');
  const [displayNum2, setDisplayNum2] = useState('');
  const [lcd, setLCD] = useState(null);
  const [steps, setSteps] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userInputFactors, setUserInputFactors] = useState({ num1: [], num2: [] });
  const [factorInputStatus, setFactorInputStatus] = useState({ num1: [], num2: [] });
  const [currentFactorsInput, setCurrentFactorsInput] = useState('');
  const [activeNumber, setActiveNumber] = useState('num1');
  const [userLCDInput, setUserLCDInput] = useState('');
  const [isLCDCorrect, setIsLCDCorrect] = useState(null);
  const [stepCompleted, setStepCompleted] = useState({
    step1: false,
    step2: false,
    step3: false
  });
  const [stepSkipped, setStepSkipped] = useState({
    step1: false,
    step2: false,
    step3: false
  });
  const [highestPowersInput, setHighestPowersInput] = useState('');
  const [highestPowersStatus, setHighestPowersStatus] = useState(null);
  const [showNavigationButtons, setShowNavigationButtons] = useState(false);
  const [navigationDirection, setNavigationDirection] = useState(null);
  const [incorrectInputs, setIncorrectInputs] = useState({
    factors: false,
    highestPowers: false,
    lcd: false
  });

  const MIN_VALUE = 1;
  const MAX_VALUE = 1000;

  const clampValue = (value) => {
    const num = parseInt(value);
    if (isNaN(num)) return '';
    return Math.max(MIN_VALUE, Math.min(MAX_VALUE, num)).toString();
  };

  const handleInputChange = (setter) => (e) => {
    const rawValue = e.target.value;
    const clampedValue = clampValue(rawValue);
    setter(clampedValue);
  };

  const generateRandomNumber = () => {
    return Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE;
  };

  const handleRandomize = () => {
    const randomNum1 = generateRandomNumber();
    const randomNum2 = generateRandomNumber();
    setInputNum1(randomNum1.toString());
    setInputNum2(randomNum2.toString());
  };

  const getPrimeFactors = (num) => {
    let factors = [];
    let divisor = 2;
    while (num > 1) {
      if (num % divisor === 0) {
        factors.push(divisor);
        num /= divisor;
      } else {
        divisor++;
      }
    }
    return factors;
  };

  const validateInputs = () => {
    if (!inputNum1 || !inputNum2) {
      return false;
    }
    const num1 = parseInt(inputNum1);
    const num2 = parseInt(inputNum2);
    if (isNaN(num1) || isNaN(num2)) {
      return false;
    }
    if (num1 <= 0 || num2 <= 0) {
      return false;
    }
    return true;
  };

  const calculateLCD = () => {
    if (!validateInputs()) return;

    const a = parseInt(inputNum1);
    const b = parseInt(inputNum2);

    // Reset all states
    setIsCalculating(true);
    setDisplayNum1(a.toString());
    setDisplayNum2(b.toString());
    setSteps([]);
    setUserInputFactors({ num1: [], num2: [] });
    setFactorInputStatus({ num1: [], num2: [] });
    setCurrentStepIndex(0);
    setActiveNumber('num1');
    setHighestPowersInput('');
    setHighestPowersStatus(null);
    setUserLCDInput('');
    setIsLCDCorrect(null);
    setStepCompleted({
      step1: false,
      step2: false,
      step3: false
    });
    setStepSkipped({
      step1: false,
      step2: false,
      step3: false
    });
    setShowNavigationButtons(false);
    setNavigationDirection(null);
    setIncorrectInputs({
      factors: false,
      highestPowers: false,
      lcd: false
    });

    const factorsA = getPrimeFactors(a);
    const factorsB = getPrimeFactors(b);

    setSteps([
      { title: `Step 1: Find the prime factors of ${a}`, factorsA, factorsB },
      { title: `Step 2: Find the prime factors of ${b}`, factorsA, factorsB },
      { title: `Step 3: Identify the highest power of each prime factor`, details: null },
      { title: `Step 4: Multiply these factors to get the LCD`, details: null },
    ]);

    setIsCalculating(false);
  };

  const handleFactorsInputChange = (e) => {
    setCurrentFactorsInput(e.target.value);
    if (incorrectInputs.factors) {
      setIncorrectInputs(prev => ({ ...prev, factors: false }));
    }
  };

  const checkFactors = () => {
    const inputFactors = currentFactorsInput
      .split(/[,\s]+/)
      .map(f => parseInt(f.trim()))
      .filter(f => !isNaN(f));
    
    if (inputFactors.length === 0) {
      setIncorrectInputs(prev => ({ ...prev, factors: true }));
      return;
    }

    const currentFactors = steps[0][activeNumber === 'num1' ? 'factorsA' : 'factorsB'];
    const isCorrect = inputFactors.length === currentFactors.length && 
      inputFactors.every((factor, index) => factor === currentFactors[index]);

    if (isCorrect) {
      const newUserInputFactors = { ...userInputFactors };
      newUserInputFactors[activeNumber] = inputFactors;
      setUserInputFactors(newUserInputFactors);

      const newFactorInputStatus = { ...factorInputStatus };
      newFactorInputStatus[activeNumber] = inputFactors.map(() => 'correct');
      setFactorInputStatus(newFactorInputStatus);

      setCurrentFactorsInput('');
      setIncorrectInputs(prev => ({ ...prev, factors: false }));
      setStepCompleted(prev => ({ ...prev, step1: true }));
      moveToNextFactorizationStep();
    } else {
      setIncorrectInputs(prev => ({ ...prev, factors: true }));
    }
  };

  const skipFactor = () => {
    const currentFactors = steps[0][activeNumber === 'num1' ? 'factorsA' : 'factorsB'];

    const newUserInputFactors = { ...userInputFactors };
    newUserInputFactors[activeNumber] = currentFactors;
    setUserInputFactors(newUserInputFactors);

    const newFactorInputStatus = { ...factorInputStatus };
    newFactorInputStatus[activeNumber] = currentFactors.map(() => 'skipped');
    setFactorInputStatus(newFactorInputStatus);

    setCurrentFactorsInput('');

    setStepCompleted(prev => ({ ...prev, step1: true }));
    setStepSkipped(prev => ({ ...prev, step1: true }));
    moveToNextFactorizationStep();
  };

  const moveToNextFactorizationStep = () => {
    if (activeNumber === 'num1') {
      setActiveNumber('num2');
    }
  };

  const proceedToNextSteps = () => {
    const factorsA = steps[0].factorsA;
    const factorsB = steps[1].factorsB;

    let lcdFactors = {};
    [...new Set([...factorsA, ...factorsB])].forEach(factor => {
      const countA = factorsA.filter(f => f === factor).length;
      const countB = factorsB.filter(f => f === factor).length;
      lcdFactors[factor] = Math.max(countA, countB);
    });

    let result = 1;
    Object.entries(lcdFactors).forEach(([factor, power]) => {
      result *= Math.pow(parseInt(factor), power);
    });

    setSteps(prevSteps => [
      prevSteps[0],
      prevSteps[1],
      { 
        title: `Step 3: Identify the highest power of each prime factor`,
        details: lcdFactors
      },
      {
        title: `Step 4: Multiply these factors to get the LCD`,
        details: `LCD = ${Object.entries(lcdFactors).map(([factor, power]) => 
          power > 1 ? `${factor}^${power}` : factor).join(' × ')}`
      },
    ]);

    setLCD(result);
  };

  const checkHighestPowers = () => {
    const inputPowers = highestPowersInput
      .split(/[,\s]+/)
      .map(p => p.trim())
      .filter(p => p);
    
    if (inputPowers.length === 0) {
      setIncorrectInputs(prev => ({ ...prev, highestPowers: true }));
      return;
    }

    const expectedPowers = Object.entries(steps[2].details)
      .map(([factor, power]) => power > 1 ? `${factor}^${power}` : factor);
    
    const isCorrect = inputPowers.length === expectedPowers.length &&
      inputPowers.every((power, index) => power === expectedPowers[index]);
    
    setHighestPowersStatus(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      setStepCompleted(prev => ({ ...prev, step2: true }));
      setIncorrectInputs(prev => ({ ...prev, highestPowers: false }));
    } else {
      setIncorrectInputs(prev => ({ ...prev, highestPowers: true }));
    }
  };
  
  const skipHighestPowers = () => {
    setHighestPowersStatus('skipped');
    setStepCompleted(prev => ({ ...prev, step2: true }));
    setStepSkipped(prev => ({ ...prev, step2: true }));
  };

  const moveToNextStep = () => {
    if (currentStepIndex < 3) {
      if (currentStepIndex === 1) {
        proceedToNextSteps();
      }
      setCurrentStepIndex(prevIndex => prevIndex + 1);
      // Reset incorrect states when moving to next step
      setIncorrectInputs({
        factors: false,
        highestPowers: false,
        lcd: false
      });
    }
  };

  const handleUserLCDInputChange = (e) => {
    setUserLCDInput(e.target.value);
    if (incorrectInputs.lcd) {
      setIncorrectInputs(prev => ({ ...prev, lcd: false }));
    }
  };

  const checkUserLCD = () => {
    if (!userLCDInput.trim()) {
      setIncorrectInputs(prev => ({ ...prev, lcd: true }));
      return;
    }

    const userLCD = parseInt(userLCDInput);
    if (!isNaN(userLCD) && userLCD === lcd) {
      setIsLCDCorrect(true);
      setStepCompleted(prev => ({ ...prev, step3: true }));
      setIncorrectInputs(prev => ({ ...prev, lcd: false }));
    } else {
      setIsLCDCorrect(false);
      setIncorrectInputs(prev => ({ ...prev, lcd: true }));
    }
  };

  const skipLCDCalculation = () => {
    setIsLCDCorrect(null);
    setStepCompleted(prev => ({ ...prev, step3: true }));
    setStepSkipped(prev => ({ ...prev, step3: true }));
  };

  const getInputClassName = (status) => {
    let baseClass = "text-sm";
    switch (status) {
      case 'correct':
        return `${baseClass} text-green-600`;
      case 'incorrect':
        return `${baseClass} text-red-600`;
      case 'skipped':
        return `${baseClass} text-green-600`;
      default:
        return `${baseClass} text-gray-600`;
    }
  };

  const renderFactorization = (number, factors, userFactors, inputStatuses) => (
    <div className="mb-4">
      {userFactors.length > 0 ? (
        <p className={`mt-2 ${getInputClassName(inputStatuses[0])}`}>
          {userFactors.join(' × ')}
        </p>
      ) : (
        <div className="mt-2">
          <input
            type="text"
            value={currentFactorsInput}
            onChange={handleFactorsInputChange}
            placeholder="e.g. 2, 3, 5"
            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#5750E3] ${
              incorrectInputs.factors ? 'border-yellow-400' : 'border-gray-300'
            }`}
          />
          <div className="flex gap-2 mt-2">
            <div className="glow-button simple-glow">
              <div className="flex gap-1">
                <button 
                  onClick={checkFactors}
                  className="bg-[#008545] hover:bg-[#00703d] text-white text-sm px-4 py-2 rounded-md min-w-[80px]"
                >
                  Check
                </button>
                <button 
                  onClick={skipFactor}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded-md min-w-[80px]"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Show navigation buttons when all steps are completed
  useEffect(() => {
    if (stepCompleted.step1 && stepCompleted.step2 && stepCompleted.step3) {
      setShowNavigationButtons(true);
    }
  }, [stepCompleted]);

  // Handle navigation
  const handleNavigateHistory = (direction) => {
    setNavigationDirection(direction);
    
    if (direction === 'back' && currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else if (direction === 'forward' && currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }

    setTimeout(() => {
      setNavigationDirection(null);
    }, 300);
  };

  const handleHighestPowersInputChange = (e) => {
    setHighestPowersInput(e.target.value);
    if (incorrectInputs.highestPowers) {
      setIncorrectInputs(prev => ({ ...prev, highestPowers: false }));
    }
  };

  return (
    <>
      <style>{`
        @property --r {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }

        .glow-button { 
          min-width: auto; 
          height: auto; 
          position: relative; 
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
          transition: all .3s ease;
          padding: 7px;
        }

        .glow-button::before {
          content: "";
          display: block;
          position: absolute;
          background: #fff;
          inset: 2px;
          border-radius: 4px;
          z-index: -2;
        }

        .simple-glow {
          background: conic-gradient(
            from var(--r),
            transparent 0%,
            rgb(0, 255, 132) 2%,
            rgb(0, 214, 111) 8%,
            rgb(0, 174, 90) 12%,
            rgb(0, 133, 69) 14%,
            transparent 15%
          );
          animation: rotating 3s linear infinite;
          transition: animation 0.3s ease;
        }

        .simple-glow.stopped {
          animation: none;
          background: none;
        }

        @keyframes rotating {
          0% {
            --r: 0deg;
          }
          100% {
            --r: 360deg;
          }
        }

        .nav-button {
          opacity: 1;
          cursor: default !important;
          position: relative;
          z-index: 2;
          outline: 2px white solid;
        }

        .nav-button-orbit {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: conic-gradient(
            from var(--r),
            transparent 0%,
            rgb(0, 255, 132) 2%,
            rgb(0, 214, 111) 8%,
            rgb(0, 174, 90) 12%,
            rgb(0, 133, 69) 14%,
            transparent 15%
          );
          animation: rotating 3s linear infinite;
          z-index: 0;
        }

        .nav-button-orbit::before {
          content: "";
          position: absolute;
          inset: 2px;
          background: transparent;
          border-radius: 50%;
          z-index: 0;
        }

        .nav-button svg {
          position: relative;
          z-index: 1;
        }
      `}</style>
      <div className="w-[500px] h-auto mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)] bg-white rounded-lg overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[#5750E3] text-sm font-medium select-none">LCD Explorer</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  value={inputNum1}
                  onChange={handleInputChange(setInputNum1)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5750E3]"
                  placeholder="First number"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  value={inputNum2}
                  onChange={handleInputChange(setInputNum2)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5750E3]"
                  placeholder="Second number"
                />
              </div>
              <Button 
                onClick={handleRandomize}
                className="bg-[#008545] hover:bg-[#00703d] text-white px-4 h-[42px] select-none"
              >
                Random
              </Button>
            </div>

            <div className={`glow-button ${!steps.length ? 'simple-glow' : 'simple-glow stopped'}`}>
              <button 
                onClick={calculateLCD}
                className="w-full bg-[#008545] hover:bg-[#00703d] text-white text-sm py-2 rounded select-none"
                disabled={isCalculating}
              >
                {isCalculating ? 'Calculating...' : 'Find LCD'}
              </button>
            </div>
          </div>
        </div>

        {steps.length > 0 && (
          <div className="p-4 bg-gray-50">
            <div className="space-y-2">
              <h3 className="text-[#5750E3] text-sm font-medium mb-2 select-none">
                Steps to find LCD:
              </h3>
              <div className="space-y-4">
                {currentStepIndex < steps.length ? (
                  <div className="w-full p-2 mb-1 bg-white border border-[#5750E3]/30 rounded-md">
                    <p className="text-sm select-none">{steps[currentStepIndex].title}</p>
                    {currentStepIndex === 0 && (
                      <>
                        {renderFactorization(displayNum1, steps[0].factorsA, userInputFactors.num1, factorInputStatus.num1)}
                        {userInputFactors.num1.length === steps[0].factorsA.length && (
                          <div className="flex items-center gap-4 mt-4 justify-end">
                            {!showNavigationButtons && (
                              <span className="text-green-600 font-bold select-none">Great Job!</span>
                            )}
                            {!showNavigationButtons && (
                              <div className="glow-button simple-glow">
                                <button 
                                  onClick={moveToNextStep}
                                  className="bg-[#008545] hover:bg-[#00703d] text-white text-sm px-4 py-2 rounded-md min-w-[80px] select-none"
                                >
                                  Continue
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    {currentStepIndex === 1 && (
                      <>
                        {renderFactorization(displayNum2, steps[1].factorsB, userInputFactors.num2, factorInputStatus.num2)}
                        {userInputFactors.num2.length === steps[1].factorsB.length && (
                          <div className="flex items-center gap-4 mt-4 justify-end">
                            {!showNavigationButtons && (
                              <span className="text-green-600 font-bold select-none">Great Job!</span>
                            )}
                            {!showNavigationButtons && (
                              <div className="glow-button simple-glow">
                                <button 
                                  onClick={moveToNextStep}
                                  className="bg-[#008545] hover:bg-[#00703d] text-white text-sm px-4 py-2 rounded-md min-w-[80px] select-none"
                                >
                                  Continue
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    {currentStepIndex === 2 && (
                      <div className="mt-2">
                        {highestPowersStatus === 'correct' || highestPowersStatus === 'skipped' ? (
                          <>
                            <p className={`text-sm ${getInputClassName(highestPowersStatus)} select-none`}>
                              {Object.entries(steps[2].details)
                                .map(([factor, power]) => power > 1 ? `${factor}^${power}` : factor)
                                .join(' × ')}
                            </p>
                            <div className="flex items-center gap-4 mt-2 justify-end">
                              {!stepSkipped.step2 && !showNavigationButtons && (
                                <span className="text-green-600 font-bold select-none">Great Job!</span>
                              )}
                              {currentStepIndex < steps.length - 1 && !showNavigationButtons && (
                                <div className="glow-button simple-glow">
                                  <button 
                                    onClick={moveToNextStep}
                                    className="bg-[#008545] hover:bg-[#00703d] text-white text-sm px-4 py-2 rounded-md min-w-[80px] select-none"
                                  >
                                    Continue
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-sm mb-2 select-none">Enter the highest power of each prime factor (e.g. 2^3, 3, 5^2):</p>
                            <input
                              type="text"
                              value={highestPowersInput}
                              onChange={handleHighestPowersInputChange}
                              placeholder="e.g. 2^3, 3, 5^2"
                              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#5750E3] ${
                                incorrectInputs.highestPowers ? 'border-yellow-400' : 'border-gray-300'
                              }`}
                            />
                            <div className="flex gap-2 mt-2">
                              <div className="glow-button simple-glow">
                                <div className="flex gap-1">
                                  <button 
                                    onClick={checkHighestPowers}
                                    className="bg-[#008545] hover:bg-[#00703d] text-white text-sm px-4 py-2 rounded-md min-w-[80px] select-none"
                                  >
                                    Check
                                  </button>
                                  <button 
                                    onClick={skipHighestPowers}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded-md min-w-[80px] select-none"
                                  >
                                    Skip
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    {currentStepIndex === 3 && (
                      <div className="mt-2 space-y-2">
                        {!stepCompleted.step3 && !stepSkipped.step3 ? (
                          <>
                            <input
                              type="number"
                              value={userLCDInput}
                              onChange={handleUserLCDInputChange}
                              placeholder="Enter your LCD calculation"
                              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#5750E3] ${
                                incorrectInputs.lcd ? 'border-yellow-400' : 'border-gray-300'
                              }`}
                            />
                            <div className="flex space-x-2">
                              <button 
                                onClick={checkUserLCD}
                                className="bg-[#008545] hover:bg-[#00703d] text-white text-sm px-4 py-2 rounded-md select-none"
                              >
                                Check LCD
                              </button>
                              <button 
                                onClick={skipLCDCalculation}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded-md select-none"
                              >
                                Skip
                              </button>
                            </div>
                            {isLCDCorrect === false && (
                              <p className="text-red-500 text-sm select-none">That's not correct. Try again or skip to see the answer.</p>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-4">
                            {!stepSkipped.step3 && !showNavigationButtons && (
                              <span className="text-green-600 font-bold select-none">Great Job!</span>
                            )}
                            <p className={`text-sm ${getInputClassName(stepSkipped.step3 ? 'skipped' : 'correct')} select-none`}>
                              LCD = {lcd}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full p-2 mb-1 bg-white border border-[#5750E3]/30 rounded-md">
                    <p className="text-sm select-none">Final Result</p>
                    <div className="mt-2">
                      <p className="text-sm select-none">
                        The LCD of {displayNum1} and {displayNum2} is <span className="font-bold text-green-600">{lcd}</span>.
                        {isLCDCorrect === true && (
                          <span className="block text-green-500 mt-2 select-none">Great job! Your calculation was correct.</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 mt-4">
                  <div
                    className="nav-orbit-wrapper"
                    style={{
                      position: 'relative',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      visibility: showNavigationButtons && currentStepIndex > 0 ? 'visible' : 'hidden',
                      opacity: showNavigationButtons && currentStepIndex > 0 ? 1 : 0,
                      pointerEvents: showNavigationButtons && currentStepIndex > 0 ? 'auto' : 'none',
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <div className="nav-button-orbit"></div>
                    <div style={{ position: 'absolute', width: '32px', height: '32px', borderRadius: '50%', background: 'white', zIndex: 1 }}></div>
                    <button
                      onClick={() => handleNavigateHistory('back')}
                      className={`nav-button w-8 h-8 flex items-center justify-center rounded-full bg-[#008545]/20 text-[#008545] hover:bg-[#008545]/30 relative z-50 select-none`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6"/>
                      </svg>
                    </button>
                  </div>
                  <span className="text-sm text-gray-500 min-w-[100px] text-center select-none">
                    Step {currentStepIndex + 1} of {steps.length}
                  </span>
                  <div
                    className="nav-orbit-wrapper"
                    style={{
                      position: 'relative',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      visibility: showNavigationButtons && currentStepIndex < steps.length - 1 ? 'visible' : 'hidden',
                      opacity: showNavigationButtons && currentStepIndex < steps.length - 1 ? 1 : 0,
                      pointerEvents: showNavigationButtons && currentStepIndex < steps.length - 1 ? 'auto' : 'none',
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <div className="nav-button-orbit"></div>
                    <div style={{ position: 'absolute', width: '32px', height: '32px', borderRadius: '50%', background: 'white', zIndex: 1 }}></div>
                    <button
                      onClick={() => handleNavigateHistory('forward')}
                      className={`nav-button w-8 h-8 flex items-center justify-center rounded-full bg-[#008545]/20 text-[#008545] hover:bg-[#008545]/30 relative z-50 select-none`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LCD;