import React from 'react';
import PropTypes from 'prop-types';

import Divider from './Divider';
import styles from './Input.module.css';

const Input = ({ errorMessage = '', ...args }) => {
    return (
        <div className={styles.InputContainer}>
            <input {...args} className={styles.Input} type="text" />
            <Divider />
            <span className={styles.ErrorMessage}>{errorMessage}</span>
        </div>
    );
};

Input.propTypes = {
    errorMessage: PropTypes.string,
};

export default Input;
