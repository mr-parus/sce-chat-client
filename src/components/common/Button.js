import PropTypes from 'prop-types';
import React from 'react';

import styles from './Button.module.css';

const Button = ({ text, ...args }) => {
    return (
        <button {...args} className={styles.Button}>
            {text}
        </button>
    );
};

Button.propTypes = {
    text: PropTypes.string.isRequired,
    style: PropTypes.object,
};

export default Button;
