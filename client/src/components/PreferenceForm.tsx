import FormWrapper from "./FormWrapper";

export type PreferenceData = {
    prefStart: string;
    prefEnd: string;
};

type PreferenceFormProps = PreferenceData & {
    updateFields: (fields: Partial<PreferenceData>) => void;
};

const PreferenceForm = ({
    prefStart,
    prefEnd,
    updateFields,
}: PreferenceFormProps) => {
    return (
        <>
            <FormWrapper title="When do you want your classes?">
                <div className="flex justify-center gap-10">
                    <div className="text-2xl">
                        <b>Start: </b>
                        <input
                            type="time"
                            value={prefStart}
                            onChange={(e) =>
                                updateFields({ prefStart: e.target.value })
                            }
                        />
                    </div>
                    <div className="text-2xl">
                        <b>End: </b>
                        <input
                            type="time"
                            value={prefEnd}
                            onChange={(e) =>
                                updateFields({ prefEnd: e.target.value })
                            }
                        />
                    </div>
                </div>
            </FormWrapper>
        </>
    );
};

export default PreferenceForm;
