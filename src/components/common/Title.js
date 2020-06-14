import React from 'react';
import PropTypes from 'prop-types';

import styles from './Title.module.css';

const Title = ({ text, style }) => {
    return (
        <h1 className={styles.Title} style={style}>
            {text}
        </h1>
    );
};

export default Title;

Title.propTypes = {
    text: PropTypes.string.isRequired,
    style: PropTypes.object,
};
