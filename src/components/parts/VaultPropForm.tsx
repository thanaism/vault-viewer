import { Button, Input, InputGroup, InputLeftAddon, InputRightElement } from '@chakra-ui/react';
import { ChangeEvent, ReactNode } from 'react';

export const VaultPropForm = (props: {
  leftLabel: string | ReactNode;
  value: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  submitLabel?: string;
  submit?: () => void;
  readOnly?: boolean;
}) => {
  const { leftLabel, value, submitLabel, placeholder, readOnly, onChange, submit } = props;
  const nonReadOnlyPropExists = submit != null || submitLabel != null || onChange != null;
  if (readOnly && nonReadOnlyPropExists) throw Error('readOnly');
  if (!readOnly && onChange == null) throw Error('not readOnly');

  return (
    <InputGroup marginBottom="2px" size="sm">
      <InputLeftAddon children={leftLabel} width="35%" overflow="hidden" fontSize="xs" />
      <Input
        placeholder={placeholder}
        width={readOnly ? '65%' : '50%'}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        fontSize="xs"
      />

      {submitLabel != null && submit != null && (
        <InputRightElement width="15%">
          <Button
            rounded="full"
            colorScheme="blue"
            height="70%"
            onClick={submit}
            minW="100%"
            ml="5px"
            size="sm"
            fontWeight="midium"
            fontSize="xs"
          >
            {submitLabel}
          </Button>
        </InputRightElement>
      )}
    </InputGroup>
  );
};
