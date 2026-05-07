




} from "react-hook-form";
import { FieldConfig } from "../types";
import CustomFieldInput from "../CustomFieldInput";
import AutocompleteFieldInput from "../AutocompleteFieldInput";
import DateTimeFieldInput from "../DateTimeFieldInput";
import TextFieldInput from "../TextFieldInput";





















































    if (field.type === "multiline") {
        return (
            <TextFieldInput
                key={`${key}-${idx}`}
                fieldKey={key}
                label={field.label}




                control={form.control}
                error={error}
                rules={rules}
                multiline
            />
        );
    }