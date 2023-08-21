// const string = "Your appointment has been reserved for 2023-10-31 14:50:00. Reference ID is 714a0b4f-6564-462f-bf74-89fd05d02b4d. Appt Block Id is 135109. Appt Encounter Id is 0.";

export function strExtraxt(inputString) {
  // Regular expressions to extract information
  const datePattern = /(\d{4}-\d{2}-\d{2})/;
  const timePattern = /(\d{2}:\d{2}:\d{2})/;
  const referenceIdPattern = /Reference ID is (\w+-\w+-\w+-\w+-\w+)/;
  const blockIdPattern = /Appt Block Id is (\d+)/;
  const encounterIdPattern = /Appt Encounter Id is (\d+)/;

  // Extracting information using regular expressions
  const dateMatch = inputString.match(datePattern);
  const timeMatch = inputString.match(timePattern);
  const referenceIdMatch = inputString.match(referenceIdPattern);
  const blockIdMatch = inputString.match(blockIdPattern);
  const encounterIdMatch = inputString.match(encounterIdPattern);

  // Extracted information
  const date = dateMatch ? dateMatch[1] : null;
  const time = timeMatch ? timeMatch[1] : null;
  const referenceId = referenceIdMatch ? referenceIdMatch[1] : null;
  const blockId = blockIdMatch ? blockIdMatch[1] : null;
  const encounterId = encounterIdMatch ? encounterIdMatch[1] : null;

  return {
    date,
    time,
    referenceId,
    blockId,
    encounterId,
  };
}
