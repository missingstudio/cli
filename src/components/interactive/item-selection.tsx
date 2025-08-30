import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import { memo } from "react";

type Item<T = any> = { label: string; value: T };

const MenuItem = ({
  isSelected = false,
  label,
}: {
  isSelected?: boolean;
  label: string;
}) => (
  <Text color={isSelected ? "yellow" : "gray"} bold={isSelected}>
    {label}
  </Text>
);
const MemoMenuItem = memo(MenuItem);

type ItemSelectionProps<T> = {
  title: string;
  items: ReadonlyArray<Item<T>>;
  onSelect: (item: Item<T>) => void;
};

export function ItemSelection<T>({
  title,
  items,
  onSelect,
}: ItemSelectionProps<T>) {
  return (
    <>
      <Box justifyContent="flex-start" marginBottom={1}>
        <Text color="gray">{title}</Text>
      </Box>
      <SelectInput
        items={[...items] as any}
        onSelect={onSelect as any}
        itemComponent={MemoMenuItem as any}
        indicatorComponent={({ isSelected }) =>
          isSelected ? <Text color="yellow">👉 </Text> : <Text> </Text>
        }
      />
    </>
  );
}
