import { WarningIcon } from "@chakra-ui/icons";
import {
	FormControl,
	FormLabel,
	Input,
	FormErrorMessage,
} from "@chakra-ui/react";
import { FieldHookConfig, useField } from "formik";
import React, { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
	label: string;
	name: string;
};

const InputField = ({ label, size: _, ...props }: InputFieldProps) => {
	const [field, { error }] = useField(props);

	return (
		<FormControl isInvalid={!!error}>
			<FormLabel htmlFor={field.name}>{label}</FormLabel>
			<Input
				{...field}
				{...props}
				id={field.name}
				placeholder={props.placeholder}
			/>
			{error ? <FormErrorMessage><WarningIcon mr={1}/>{error}</FormErrorMessage> : null}
		</FormControl>
	);
};
export default InputField;
