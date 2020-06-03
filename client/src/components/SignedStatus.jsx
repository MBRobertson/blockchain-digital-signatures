import React from 'react';

export const SignedStatus = ({ status }) => {
    return <div className={`Contract-Status status-${status}`}>{(() => {
        switch (status) {
            case -2:
                return "Checking"
            case -1:
                return "Signed (Invalid)"
            case 0:
                return "Not Signed"
            case 1:
                return "Signed"
            default:
                return "Unexpected Result"
        }
    })()}</div>
}