import { CMDKey } from "rompot";

import WorkoutController from "@modules/workout/controllers/WorkoutController";
import { WorkoutCategory } from "@modules/workout/models/WorkoutCategory";
import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import Workout from "@modules/workout/models/Workout";
import Command from "@modules/command/models/Command";

import TextUtils from "@utils/TextUtils";

//! ===== Configurando comando =====

export const cmd = new Command(CommandDataUtils.generateEmpty({ workouts: [] as Workout[], categories: [] as WorkoutCategory[], category: WorkoutCategory.Other, options: [] as string[] }));

cmd.id = "list-workouts";
cmd.keys = [CMDKey("exercícios"), CMDKey("exercicios"), CMDKey("treinos")];

//! ===== Etapa 1: Obtendo os exercícios =====

cmd.addTask(async (data, next) => {
  const workoutController = new WorkoutController(RepositoryUtils.getWorkoutRepository());

  data.categories = Object.values(WorkoutCategory);
  data.workouts = await workoutController.listAllWorkouts(cmd.client.id);

  if (data.workouts.length == 0) {
    await cmd.sendMessage("Nenhum exercício foi adicionado no bot! ❌");

    return cmd.stopTasks();
  }

  return next(data);
});

//! ===== Etapa 2: Listando categorias =====

cmd.addTask(async (data, next) => {
  const textUtils = new TextUtils(TextUtils.bold("💪 Categorias de exercícios"))
    .add(TextUtils.lineDecorator())
    .addLine(TextUtils.generateOptions(Object.values(WorkoutCategory)))
    .addLine()
    .addLine(`Digite a categoria desejada:`);

  await cmd.sendMessage(textUtils.getText());

  return next(data);
});

//! ===== Etapa 3: Listando exercícios =====

cmd.addTask(
  cmd.waitForOption(cmd.getDataValue("categories"), async (data, option, next) => {
    if (option == null) {
      await cmd.sendMessage("A lista de exercícios do bot foi fechada ✅");

      return cmd.stopTasks();
    }

    console.log(option, data.categories[option]);

    data.workouts = data.workouts.filter((workout) => {
      return workout.categories.includes(data.categories[option]);
    });

    if (data.workouts.length == 0) {
      await cmd.sendMessage("Nenhum exercício com essa categoria foi adicionado no bot! ❌");

      return cmd.stopTasks();
    }

    data.options = data.workouts.map((workout) => workout.name);

    const textUtils = new TextUtils(TextUtils.bold("💪 Lista de exercícios"))
      .add(TextUtils.lineDecorator())
      .addLine(TextUtils.generateOptions(data.options))
      .addLine()
      .addLine(`Digite o exercício desejado:`);

    await cmd.sendMessage(textUtils.getText());

    return next(data);
  })
);

//! ===== Etapa 4: Obtendo exercício =====

cmd.addTask(
  cmd.waitForOption(cmd.getDataValue("options"), async (data, option, next) => {
    if (option == null) {
      await cmd.sendMessage("A lista de exercícios do bot foi fechada ✅");

      return cmd.stopTasks();
    }

    const workout = data.workouts[option];

    const textUtils = new TextUtils(TextUtils.bold("🏋️‍♂️ DADOS DO EXERCÍCIO:"))
      .add(TextUtils.lineDecorator())
      .addLine(TextUtils.bold("📌 TIPO:"))
      .add(` ${workout.type}`)
      .addLine()
      .addLine(TextUtils.bold("👤 NOME:"))
      .add(` ${workout.name}`)
      .addLine()
      .addLine(TextUtils.bold("📝 DESCRIÇÃO:"))
      .add(` ${workout.description}`);

    if (workout.muscles.length > 0) {
      textUtils
        .addLine()
        .add(TextUtils.lineDecorator())
        .addLine(TextUtils.bold("💪 MÚSCULOS ATIVADOS:"))
        .addLine()
        .addLine(workout.muscles.map((muscle) => `- ${muscle}`).join("\n"));
    }

    await cmd.sendMessage(textUtils.getText());

    return cmd.stopTasks();
  })
);

export default [cmd];
