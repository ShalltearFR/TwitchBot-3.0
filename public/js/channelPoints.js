const uid = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const fetchJSON = async (url) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

const deleteDiv = (id) => {
  const selectedDiv = document.getElementById(id);
  selectedDiv.remove();
};

const createOption = (value, text) => {
  const option = document.createElement("option");
  option.value = value;
  option.text = text;
  return option;
};

const createLabelWithOptions = (title, effect, list, object) => {
  const label = document.createElement("label");
  label.innerHTML = `<span class="select-none">${title} </span>`;
  const select = document.createElement("select");

  if (effect === "reward") {
    list.forEach((rewardSingle) => {
      select.appendChild(createOption(rewardSingle.id, rewardSingle.title));
    });
    select.value = object.rewardID;
  }

  if (effect === "type") {
    list.forEach((type) => {
      select.appendChild(createOption(type.value, type.text));
    });
    select.value = object.type;
    if (object.type === "obs filterEnabled") {
      select.text = "Filtre OBS";
    } else if (object.type === "obs rotation") {
      select.text = "Rotation OBS";
    } else if (object.type === "socket io") {
      select.text = "Autres";
    }
  }

  label.appendChild(select);
  return label;
};

const createLabelWithInput = (title, type, value) => {
  const label = document.createElement("label");
  label.innerHTML = `<span class="select-none">${title} </span>`;
  const input = document.createElement("input");
  input.setAttribute("type", type);
  input.value = type === "number" ? value / 1000 : value;
  label.appendChild(input);
  return label;
};

const createSingleExec = () => {
  const execSingleUid = uid();
  const exec = document.createElement("div");
  exec.classList.add("ml-16", "flex", "gap-x-2");
  exec.setAttribute("id", execSingleUid);

  const execFirstLabel = document.createElement("label");
  execFirstLabel.innerHTML = `<span class="select-none">Nom de l'évènement : </span>`;
  const execFirstSelect = document.createElement("select");

  ["Confetti", "Malware"].forEach((scene) => {
    execFirstSelect.appendChild(createOption(scene, scene));
  });
  //execFirstSelect.value = execSingle.name;
  execFirstLabel.appendChild(execFirstSelect);
  exec.appendChild(execFirstLabel);
  return exec
};

const createExecs = async (type, execList, scenesList) => {
  const label = document.createElement("label");
  label.innerHTML = '<span class="select-none">Execution(s) :</span>';
  const createExecButton = document.createElement("button");
  createExecButton.classList.add(
    "btn",
    "rounded-full",
    "px-2",
    "text-xl",
    "bg-white"
  );
  createExecButton.innerText = "+";
  createExecButton.addEventListener("mousedown", (event) => {
    console.log("fsdfs");
    label.appendChild(createSingleExec(
      "socket io",
      [
        {
          name: "confetti",
          arg: "",
        },
      ],
      scenesList
    ));
    event.stopPropagation(); // Arrête la propagation de l'événement de clic
  });
  label.appendChild(createExecButton);

  for (const execSingle of execList) {
    const execUid = uid();
    const exec = document.createElement("div");
    exec.classList.add("ml-16", "flex", "gap-x-2");
    exec.setAttribute("id", execUid);

    if (type !== "socket io") {
      const execFirstLabel = document.createElement("label");
      execFirstLabel.innerHTML =
        '<span class="select-none">Nom de la scène : </span>';
      const execFirstSelect = document.createElement("select");

      scenesList.forEach((scene) => {
        execFirstSelect.appendChild(
          createOption(scene.sceneName, scene.sceneName)
        );
      });
      execFirstSelect.value = execSingle.sceneName;
      execFirstLabel.appendChild(execFirstSelect);
      exec.appendChild(execFirstLabel);

      const sourcesList = await fetchJSON(
        `/api/obsItemsList?sceneName=${execSingle.sceneName}`
      );
      const execSecondLabel = document.createElement("label");
      execSecondLabel.innerHTML =
        '<span class="select-none">Nom de la source : </span>';
      const execSecondSelect = document.createElement("select");

      if (type === "obs filterEnabled") {
        sourcesList.forEach((source) => {
          execSecondSelect.appendChild(
            createOption(source.sourceName, source.sourceName)
          );
        });
        execSecondSelect.value = execSingle.sourceName;
      }
      execSecondLabel.appendChild(execSecondSelect);
      exec.appendChild(execSecondLabel);

      if (type === "obs rotation") {
        sourcesList.forEach((source) => {
          execSecondSelect.appendChild(
            createOption(source.sceneItemId, source.sourceName)
          );
        });
        execSecondSelect.value = execSingle.sceneItemId;
        exec.appendChild(
          createLabelWithInput("Rotation :", "text", execSingle.degree)
        );
      }
    } else {
      const execFirstLabel = document.createElement("label");
      execFirstLabel.innerHTML = `<span class="select-none">Nom de l'évènement : </span>`;
      const execFirstSelect = document.createElement("select");

      ["Confetti", "Malware"].forEach((scene) => {
        execFirstSelect.appendChild(createOption(scene, scene));
      });
      execFirstSelect.value = execSingle.name;
      execFirstLabel.appendChild(execFirstSelect);
      exec.appendChild(execFirstLabel);
    }
    const delButton = document.createElement("button");
    delButton.classList.add(
      "rounded-full",
      "px-2",
      "text-xl",
      "bg-white",
      "ml-auto"
    );
    delButton.innerText = "X";
    delButton.onclick = () => {
      deleteDiv(execUid);
    };
    exec.appendChild(delButton);

    label.appendChild(exec);
  }
  return label;
};

const rewardsCardElement = document.querySelector("#rewardsCard");
const initializeRewardsCard = async () => {
  const rewardFile = await fetchJSON("/api/rewardsFile");
  const rewardsList = await fetchJSON("/api/rewardsList");
  const scenesList = await fetchJSON("/api/obsScenesList");

  rewardFile?.data?.forEach(async (reward, index) => {
    const card = document.createElement("div");
    card.classList.add(
      "flex",
      "flex-col",
      "bg-gray-300",
      "p-2",
      "rounded-xl",
      "m-4"
    );
    card.setAttribute("id", uid());

    card.appendChild(
      createLabelWithOptions(
        "Nom de la récompense :",
        "reward",
        rewardsList,
        reward
      )
    );
    card.appendChild(
      createLabelWithOptions(
        "Type d'événement :",
        "type",
        [
          { value: "obs filterEnabled", text: "Filtre OBS" },
          { value: "obs rotation", text: "Rotation OBS" },
          { value: "socket io", text: "Autres" },
        ],
        reward,
        index
      )
    );

    if (reward.type !== "socket io") {
      card.appendChild(
        createLabelWithInput("Temps d'effet (en ms) :", "number", reward.effectCooldown)
      );
    }

    const execLabel = await createExecs(reward.type, reward.exec, scenesList);
    card.appendChild(execLabel);

    rewardsCardElement.appendChild(card);
  });

  // const createExecButton = document.createElement("button");
  // createExecButton.onclick = () => {
  //   createExecs("socket io", [{
  //     name: "confetti",
  //     arg: ""
  //   }], scenesList);
  // };
};

initializeRewardsCard();