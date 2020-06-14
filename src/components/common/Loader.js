import React, { useEffect, useState } from 'react';

import './Loader.css';

const Loader = () => {
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowMessage(true), 3000);

        return () => {
            clearTimeout(timer);
        };
    });

    return (
        <>
            <div className="loader">
                <div className="col-sm-2">
                    <span className="sp sp-3balls" />
                </div>
            </div>
            {showMessage ? <small>If too long, check socket connection...</small> : null}
        </>
    );
};

export default Loader;
