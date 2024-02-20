import FormWrapper from "./FormWrapper";

export type PreferenceData = {
    prefStart: string;
    prefEnd: string;
};

type PreferenceFormProps = PreferenceData & {
    updateFields: (fields: Partial<PreferenceData>) => void;
};

const PreferenceForm = ({ prefStart, updateFields }: PreferenceFormProps) => {
    return (
        <>
            <FormWrapper title="When do you want your classes?">
                <div className="flex flex-col justify-center gap-10 text-xl">
                    <div className="flex items-center gap-2">
                        <b>Earliest class: </b>
                        <div className="p-3">
                            <input
                                type="time"
                                value={prefStart}
                                onChange={(e) =>
                                    updateFields({ prefStart: e.target.value })
                                }
                            />
                        </div>
                    </div>
                </div>
            </FormWrapper>
        </>
    );
};

export default PreferenceForm;
