import { useCallback, useState } from 'react';

export function useInput(initialValue, validate = () => true) {
    const initialState = { value: initialValue, isValid: validate(initialValue) };
    const [{ isValid, value }, setState] = useState(initialState);

    const handleChange = useCallback(
        (e) => {
            const { value } = e.target;

            const newState = {
                value,
                isValid: !value ? false : validate(value),
            };
            setState(newState);
        },
        [validate]
    );

    return {
        isValid,
        onChange: handleChange,
        reset: () => setState(initialState),
        value,
    };
}
