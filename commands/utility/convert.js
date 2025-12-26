// yes i think imperial units are stupid

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const math = require('mathjs');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('convert')
    .setDescription('convert between units')
    .addStringOption((option) => option.setName('value').setDescription("value to convert").setRequired(true))
    .addStringOption((option) => option.setName('from').setDescription("the unit to convert from").setRequired(true))
    .addStringOption((option) => option.setName('to').setDescription("the unit to convert to").setRequired(true)),
  async execute(interaction) {
	  const value = interaction.options.getString('value');
	  const from = interaction.options.getString('from');
	  const to = interaction.options.getString('to');


    const units = [
      "nm", "um", "mm", "cm", "m", "km", // metric distance values
      "in", "ft", "ch", "yd", "mi", // stupid distance values
      "nL", "uL", "mL", "cL", "L", "kL", // metric volume values
      "floz", "gi", "pt", "qt", "gal", // stupid volume values
      "ng", "ug", "mg", "cg", "g", "kg", "t", // metric weight values
      "gr", "dr", "oz", "lb", "cwt", "ton", // stupid volume values
    ];

    const out = math.unit(`${value} ${from}`).toNumeric(to).toString();

    await interaction.reply(`${value} ${from} = ${out} ${to}`);
  },
};