import React, { useState, useEffect } from "react";
import { Provider, defaultTheme, Button, TextField, View, Text, Heading, Flex, ToggleButton } from "@adobe/react-spectrum";

function App() {
  const [number, setNumber] = useState<string>('');
  const [roman, setRoman] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(darkModeMediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  function handleNumberChange(value: string) {
    setNumber(value);
    setError('');
    
    if (value === '') {
      return;
    }
    
    // Check for non-digit characters or special characters
    if (!/^\d+$/.test(value)) {
      setError('Please enter only digits');
      return;
    }
    
    const num = parseInt(value);
    if (num < 1 || num > 3999) {
      setError('Please enter a number between 1 and 3999');
    }
  }

  async function convertNumber() {
    if (!number || error) return;
    setLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/romannumeral?query=${number}`);
      if (!response.ok) {
        const errorText = await response.text();
        setRoman(errorText);
      } else {
        const data: { input: string; output: string } = await response.json();
        setRoman(data.output);
      }
    } catch (error) {
      setRoman('Error contacting server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Provider theme={defaultTheme} colorScheme={isDark ? "dark" : "light"}>
      <View position="fixed" top="size-100" right="size-100" zIndex={1}>
        <ToggleButton
          isSelected={isDark}
          onChange={setIsDark}
        >
          {isDark ? "🌙" : "☀️"}
        </ToggleButton>
      </View>

      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        gap="size-100"
        width="100%"
        maxWidth="size-6000"
        marginX="auto"
      >
        <View 
          width="100%"
          backgroundColor="gray-50"
          padding="size-400"
          borderRadius="regular"
          UNSAFE_style={{
            border: 'none',
            boxShadow: 'none',
            outline: 'none'
          }}
        >
          <Flex direction="column" gap="size-300" alignItems="center">
            <Heading level={1} UNSAFE_style={{ textAlign: 'center' }}>Roman Numeral Converter</Heading>
            <TextField
              label="Enter a Number (1-3999)"
              value={number}
              onChange={handleNumberChange}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              isRequired
              width="100%"
              validationState={error ? "invalid" : undefined}
              errorMessage={error}
            />

            <Button
              variant="primary"
              onPress={convertNumber}
              isDisabled={loading || !number || !!error}
              width="100%"
            >
              {loading ? "Converting..." : "Convert"}
            </Button>

            {roman && (
              <View marginTop="size-300">
                <Text UNSAFE_style={{ fontSize: 'var(--spectrum-global-dimension-size-200)' }}>
                  <strong>Roman Numeral:</strong> {roman}
                </Text>
              </View>
            )}
          </Flex>
        </View>
      </Flex>
    </Provider>
  );
}

export default App;