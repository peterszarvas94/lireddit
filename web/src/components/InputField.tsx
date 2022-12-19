import { WarningIcon } from "@chakra-ui/icons";
import {
	FormControl, FormErrorMessage, FormLabel,
	Input, Textarea
} from "@chakra-ui/react";
import { useField } from "formik";
import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> &
	TextareaHTMLAttributes<HTMLTextAreaElement> & {
		label: string;
		name: string;
		textarea?: boolean;
	};

const InputField = ({
	label,
	textarea,
	size: _,
	...props
}: InputFieldProps) => {
	const TextAreaOrInput = textarea ? Textarea : Input;
	const [field, { error }] = useField(props);

	return (
		<FormControl isInvalid={!!error}>
			<FormLabel htmlFor={field.name}>{label}</FormLabel>
			<TextAreaOrInput
				{...field}
				{...props}
				id={field.name}
				placeholder={props.placeholder}
			/>
			{error ? (
				<FormErrorMessage>
					<WarningIcon mr={1} />
					{error}
				</FormErrorMessage>
			) : null}
		</FormControl>
	);
};
export default InputField;
