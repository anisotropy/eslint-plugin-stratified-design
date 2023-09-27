import { func } from "../layer3/1 lib"; // lint error occurs!!

func(1);

const fn1 = () => "";

const fn2 = () => {
  fn1();
};

export { fn2 };
