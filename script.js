// -------- Utility Functions --------

const $ = sel => document.querySelector(sel);

const $$ = sel => document.querySelectorAll(sel);

// -------- Play sound --------

function playSound(id) {

  if (!localStorage.getItem("sound") || localStorage.getItem("sound") === "on") {

    const sound = $(id);

    if (sound) {

      sound.currentTime = 0;

      sound.play();

    }

  }

}
