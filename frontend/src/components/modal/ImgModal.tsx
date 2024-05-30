import { useAppDispatch, useAppSelector } from "../../hooks";
import { setImgModal } from "../../slice/modalSlice";

export default function ImgModal() {
  const dispatch = useAppDispatch();
  const show = useAppSelector((state) => state.modal.imgModal.display);
  const imgSrc = useAppSelector((state) => state.modal.imgModal.src);

  if (!show) {
    return null;
  }

  const closeModal = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if ((e.target as HTMLInputElement).id != "modal-img") {
      dispatch(setImgModal({ value: false, src: "" }));
    }
  };
  return (
    <div
      className="fixed top-0 left-0 z-10 w-screen h-screen bg-black bg-opacity-80"
      onClick={closeModal}
    >
      <img
        src={imgSrc}
        className="fixed top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 object-contain pointer-events-none w-full h-full"
        id="modal-img"
      />
    </div>
  );
}
