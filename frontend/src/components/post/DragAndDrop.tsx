import { Input } from "../ui/input";

type Props = {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const DragAndDrop = ({ handleChange }: Props) => {
  return (
    <div className="flex justify-center items-center my-5">
      <input
        type="file"
        id="image-input"
        accept="image/*"
        onChange={handleChange}
        multiple={true}
      />
    </div>
  );
};

export default DragAndDrop;
