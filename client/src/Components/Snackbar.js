import React, { useState, forwardRef, useImperativeHandle} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import{faCircleCheck,faCircleExclamation} from '@fortawesome/free-solid-svg-icons';
library.add(faCircleCheck,faCircleExclamation);

const Snackbar = forwardRef(({message},ref) => {
  const [showSnackbar,setShowSnackbar] = useState(false);

  useImperativeHandle(ref, () => ({
      show(){
          setShowSnackbar(true);
          setTimeout(() => {
              setShowSnackbar(false);
          },5000)
      },
  }))
  return (
    <div 
      className="Snackbar" 
      style={{
          backgroundColor: "#ffffff",
          color: "black",
        }}
      id={showSnackbar ? "show" : "hide"}
    >
        <div className="symbol">
            <FontAwesomeIcon icon="fa-solid fa-circle-check" />
        </div>
        <div className="message">{message}</div>
    </div>
  );
})

export default Snackbar;